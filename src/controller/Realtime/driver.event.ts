import { Server as SocketIOServer, Socket } from "socket.io";
import { redisClient } from "../../config/redis";
import Orders from "../../model/order.model";

export async function sendOrderToNextDriver(io: SocketIOServer, orderId: string, restaurantName: string) {
    try {
        const order = await Orders.findById(orderId);
        if (!order || order.status !== 'Ordered') return;

        const driverId = await redisClient.lpop(`order_queue:${orderId}`);
        
        if (!driverId) {
            console.log(`❌ Hết tài xế trong hàng đợi của đơn ${orderId}.`);
            io.to(`order_room:${orderId}`).emit('order:failed', { message: 'Không tìm thấy tài xế xung quanh.' });
            return;
        }

        const driverStatus = await redisClient.hget(`driver_info:${driverId}`, 'status');
        if (driverStatus !== 'Available') {
            // ĐÃ FIX: Truyền `io` vào lời gọi đệ quy
            return sendOrderToNextDriver(io, orderId, restaurantName);
        }

        const driverSocketId = await redisClient.get(`socket_mapping:${driverId}`);
        if (driverSocketId) {
            console.log(`🔔 Đang mời tài xế ${driverId} nhận đơn ${orderId}...`);
            io.to(driverSocketId).emit('driver:ping_new_order', { orderId, restaurantName });

            setTimeout(async () => {
                const checkOrder = await Orders.findById(orderId);
                if (checkOrder && checkOrder.status === 'Ordered') {
                    console.log(`⏱️ Tài xế ${driverId} hết 15s phản hồi đơn ${orderId}. Chuyển người tiếp theo.`);
                    // ĐÃ FIX: Truyền `io` vào lời gọi đệ quy
                    await sendOrderToNextDriver(io, orderId, restaurantName);
                }
            }, 15000);
        } else {
            // ĐÃ FIX: Truyền `io` vào lời gọi đệ quy
            return sendOrderToNextDriver(io, orderId, restaurantName);
        }

    } catch (error) {
        console.error('Lỗi điều phối hàng đợi đơn hàng:', error);
    }
}

export const registerDriverEvent = (io: SocketIOServer, socket: Socket) => {
    const driverId = socket.data.userId; 

    redisClient.set(`socket_mapping:${driverId}`, socket.id);

    // 1. Lắng nghe cập nhật vị trí
    socket.on("driver:update_location", async (data: { longitude: number, latitude: number, cityId: string }) => {
        const { longitude, latitude, cityId } = data;
        if (!longitude || !latitude) return;

        try {
            await redisClient.geoadd(`driver_geo:${cityId}`, longitude, latitude, driverId);
            await redisClient.hset(`driver_info:${driverId}`, {
                longitude, latitude, cityId,
                status: 'Available',
                updatedAt: Date.now()
            });
            await redisClient.sadd('drivers:active_buffer', driverId);
        } catch (error) {
            console.error(`[Redis] Lỗi cập nhật vị trí tài xế ${driverId}:`, error);
        }
    });

    // 2. Lắng nghe nhận đơn hàng
    socket.on('driver:accept_order', async (data: { driverId: string, orderId: string }) => {
        const { driverId, orderId } = data;
        console.log(`🔔 Tài xế ${driverId} đã nhận đơn ${orderId}`)

        try {
            const updatedOrder = await Orders.findOneAndUpdate(
                { _id: orderId, status: 'Ordered' }, 
                { status: 'Driver_Assigned', driverId: driverId },
                { new: true }
            );

            if (!updatedOrder) {
                return socket.emit('order:error', { 
                    message: 'Đơn hàng này đã được tài xế khác nhận hoặc đã bị hủy!' 
                });
            }

            await redisClient.hset(`driver_info:${driverId}`, 'status', 'Busy');
            socket.join(`order_room:${orderId}`);
            socket.emit('driver:accept_success', { orderId, status: 'Driver_Assigned' });
            io.to(`order_room:${orderId}`).emit('order:status_changed', {
                orderId, status: 'Driver_Assigned', driverId
            });

            console.log(`🏍️ Tài xế ${driverId} đã GIÀNH ĐƯỢC đơn ${orderId}`);
        } catch (error) {
            console.error('Lỗi khi nhận đơn:', error);
        }
    });

    // 3. Lắng nghe từ chối đơn
    socket.on('driver:reject_order', async (data: { driverId: string, orderId: string, restaurantName: string }) => {
        const { driverId, orderId, restaurantName } = data;
        console.log(`❌ Tài xế ${driverId} từ chối đơn ${orderId}`);
        // ĐÃ FIX: Truyền io vào
        await sendOrderToNextDriver(io, orderId, restaurantName);
    });

    // ĐÃ FIX: Nhớ xóa mapping khi tài xế disconnect
    socket.on('disconnect', () => {
        redisClient.del(`socket_mapping:${driverId}`);
    });
};

// ==========================================
// TÁCH RIÊNG SỰ KIỆN CỦA CUSTOMER VÀO ĐÂY
// ==========================================
export const registerCustomerEvent = (io: SocketIOServer, socket: Socket) => {
    socket.on('order:create', async (orderData: any) => {
        const { restaurantLng, restaurantLat, cityId, restaurantName, totalPrice, user } = orderData;
    
        try {
            const newOrder = await Orders.create({
                restaurant: restaurantName, user, status: 'Ordered', totalPrice
            });
    
            const nearbyDrivers = await redisClient.geosearch(
                `driver_geo:${cityId}`,
                'FROMLONLAT', restaurantLng, restaurantLat,
                'BYRADIUS', 5, 'km', 'ASC'
            ) as any[]; // Type ép kiểu tạm cho return của ioredis geosearch
    
            if (!nearbyDrivers || nearbyDrivers.length === 0) {
                return socket.emit('order:failed', { message: 'Không có tài xế nào xung quanh.' });
            }
    
            const driverIds = nearbyDrivers.map(item => item[0]);
    
            const queueKey = `order_queue:${newOrder._id}`;
            await redisClient.rpush(queueKey, ...driverIds);
            await redisClient.expire(queueKey, 600); 
    
            // ĐÃ FIX: Truyền io vào
            await sendOrderToNextDriver(io, newOrder._id.toString(), restaurantName);
    
        } catch (error) {
            console.error('Lỗi tạo đơn:', error);
        }
    });
};