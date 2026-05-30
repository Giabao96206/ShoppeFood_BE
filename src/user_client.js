const { io } = require("socket.io-client");
const jwt = require("jsonwebtoken");

// ==========================================
// 1. CẤU HÌNH THÔNG TIN GIẢ LẬP KHÁCH HÀNG
// ==========================================
const BACKEND_URL = "http://localhost:5000"; 
const JWT_SECRET = "30b422a57893125e9d97034b1085023963457a4192a6c11d13f9f44a86b9f493b827f8a9e525143a5796a328373b9e43b174775d79435b6a715f5c9e2b17b629"; 
const mockUserId = "69e22726d740bcd70044d4fe"; // ID khách hàng của bạn

// Token này có role: "user" để BE đưa vào room của khách
const mockToken = jwt.sign(
    { userID: mockUserId, role: "user" }, 
    JWT_SECRET, 
    { expiresIn: "1h" }
);

console.log("⏳ Khách hàng đang mở app...");
const socket = io(BACKEND_URL, {
    auth: { access_token: mockToken }
});

// ==========================================
// 2. LOGIC TẠO ĐƠN HÀNG NGẪU NHIÊN
// ==========================================
socket.on("connect", () => {
    console.log(`✅ Khách hàng kết nối thành công! Socket ID: ${socket.id}`);

    // Hàm sinh dữ liệu đơn hàng ngẫu nhiên
    const fireRandomOrder = () => {
        // Sinh một Order ID ngẫu nhiên có độ dài tương đương ObjectId
        const randomOrderId = "69f" + Math.random().toString(16).slice(2, 23).padEnd(21, '0');
        
        // Random giá tiền từ 30k đến 150k
        const randomPrice = Math.floor(Math.random() * 12 + 3) * 10000; 
        
        // Random tọa độ gần khu vực trung tâm Đà Nẵng
        const randomLng = 108.2000 + (Math.random() * 0.05);
        const randomLat = 16.0500 + (Math.random() * 0.05);

      // user_client.js
const orderPayload = {

    restaurantId: "66d581385d45fefd8b0b89dc", // ID nhà hàng
    
    // THÊM CÁC TRƯỜNG CÒN THIẾU Ở ĐÂY:
    userId: mockUserId, // Gửi ID của user lên
    quantity: 1,        // Thêm số lượng
    cityId: "DAD",      // Thêm mã thành phố
    
    pickupLocation: { 
        type: "Point", // <--- Quan trọng: Phải có type = Point
        coordinates: [108.2211, 16.0711] 
    }, 
    dropoffLocation: { 
        type: "Point", // <--- Quan trọng: Phải có type = Point
        coordinates: [randomLng, randomLat] 
    }, 
    totalPrice: randomPrice,
    note: "Nhớ lấy nhiều tương ớt nha tài xế!"
};

        console.log(`\n🍔 [USER] Đang đặt đơn hàng mới... Giá: ${randomPrice}đ`);
        
        // Bắn event tạo đơn lên server
        socket.emit("user:create_order", orderPayload);
    };

    // Vừa vào app thì bắn 1 đơn liền
    setTimeout(fireRandomOrder, 2000);

    // Bỏ comment dòng dưới nếu muốn spam cứ 15 giây bắn 1 đơn
    // setInterval(fireRandomOrder, 15000);
});

// ==========================================
// 3. LẮNG NGHE TÀI XẾ NHẬN ĐƠN
// ==========================================
// Sự kiện này được BE bắn về khi file driver_client.js bấm "Nhận đơn"
socket.on("order:status_changed", (data) => {
    if (data.status === "Driver_Assigned") {
        console.log(`🛵 [THÔNG BÁO] Tuyệt vời! Tài xế ${data.driverId} đã nhận đơn hàng ${data.orderId} của bạn.`);
    }
});

socket.on("connect_error", (err) => {
    console.error("❌ Lỗi kết nối (Sai token hoặc server tắt):", err.message);
});