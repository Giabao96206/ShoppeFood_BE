import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { authSocketMiddleware } from "./middleware/userMessages.middleware";
import { registerMessageEvent } from "./controller/Realtime/message.event";
import { registerReadEvent } from "./controller/Realtime/read.event";
import { registerDisconnectEvent } from "./controller/Realtime/disconnect.event";
import { registerEdit } from "./controller/Realtime/editChat.event";
import { registerDriverEvent, sendOrderToNextDriver } from "./controller/Realtime/driver.event";
import Orders from "./model/order.model";
import { redisClient } from "./config/redis";
export const onLineUsers = new Map();
export const initializeSocket = (httpServer: HttpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.use(authSocketMiddleware);

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;
    const role = socket.data.role;
    // ==========================================
    // 1. NHÓM TÍNH NĂNG CHUNG
    // ==========================================
    onLineUsers.set(userId, socket.id);
    socket.broadcast.emit("user_online", userId); 

    socket.on("request_online_users", () => {
      const currentOnlineUsers = Array.from(onLineUsers.keys());
      socket.emit("get_online_users", currentOnlineUsers);
    });
    
   socket.on("user:create_order", async (orderPayload) => {
        console.log(`[Backend] Nhận được đơn hàng mới từ User ${userId}`);
        
        try {
            // 1. Lưu đơn hàng vào MongoDB (Đoạn này của bạn đã chạy OK)
            const newOrder = await Orders.create({ ...orderPayload, user: userId }); 
            console.log(`✅ Đã lưu đơn hàng ${newOrder._id} vào Database.`);
            

            // 2. Lấy tọa độ Quán ăn (Pickup) từ payload để quét tài xế xung quanh
            // Cấu trúc GeoJSON: coordinates[0] là Lng, coordinates[1] là Lat
            const [restaurantLng, restaurantLat] = orderPayload.pickupLocation.coordinates;
            const cityId = orderPayload.cityId || "DAD";

            // 3. Quét tìm các tài xế trong bán kính 5km xung quanh quán ăn bằng Redis Geo
            const nearbyDrivers = await redisClient.geosearch(
                `driver_geo:${cityId}`,
                'FROMLONLAT', restaurantLng, restaurantLat,
                'BYRADIUS', 5, 'km', 'ASC'
            ) as string[]; // Trả về mảng các Driver ID dạng chuỗi

            // Nếu không có tài xế nào bật app ở gần quán
            if (!nearbyDrivers || nearbyDrivers.length === 0) {
                console.log(`⚠️ Không tìm thấy tài xế nào xung quanh quán ăn cho đơn ${newOrder._id}`);
                return socket.emit('order:failed', { message: 'Không có tài xế nào xung quanh khu vực này.' });
            }

            console.log(`🎯 Tìm thấy ${nearbyDrivers.length} tài xế xung quanh:`, nearbyDrivers);

            // 4. Đẩy danh sách ID tài xế tìm được vào Hàng đợi Redis (Queue) của đơn hàng này
            const queueKey = `order_queue:${newOrder._id}`;
            await redisClient.rpush(queueKey, ...nearbyDrivers);
            await redisClient.expire(queueKey, 600); // Hàng đợi tự hủy sau 10 phút nếu không ai nhận

            // 5. KÍCH HOẠT: Gọi hàm phát chuông cho tài xế đầu tiên trong hàng đợi
            const restaurantName = "Cửa hàng ShopeeFood Giả Lập"; 
            await sendOrderToNextDriver(io, newOrder._id.toString(), restaurantName);

        } catch (error) {
            console.error("❌ Lỗi khi tạo và điều phối đơn hàng:", error);
            socket.emit('order:error', { message: 'Hệ thống điều phối đơn gặp lỗi.' });
        }
    });

    registerMessageEvent(io, socket);
    registerReadEvent(io, socket);
    registerDisconnectEvent(io, socket, onLineUsers);

    // ==========================================
    // 2. NHÓM TÍNH NĂNG PHÂN QUYỀN
    // ==========================================
    if (role === "driver") {
      socket.join(`driver:${userId}`); 
      registerDriverEvent(io, socket); 
    } else {
      socket.join(userId); 
      registerEdit(io, socket); 
    }
  });
  return io;
};