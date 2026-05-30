const { io } = require("socket.io-client");
const jwt = require("jsonwebtoken");

// ==========================================
// 1. CẤU HÌNH THÔNG TIN GIẢ LẬP
// ==========================================
const BACKEND_URL = "http://localhost:5000"; 
const JWT_SECRET = "30b422a57893125e9d97034b1085023963457a4192a6c11d13f9f44a86b9f493b827f8a9e525143a5796a328373b9e43b174775d79435b6a715f5c9e2b17b629"; 
const mockDriverId = "66d581385d45fefd8b012345";

// Ký Token giả lập cho tài xế
const mockToken = jwt.sign(
    { userID: mockDriverId, role: "driver" }, 
    JWT_SECRET, 
    { expiresIn: "1h" }
);

console.log("⏳ [DRIVER] Đang kết nối tới server...");
const socket = io(BACKEND_URL, {
    auth: { access_token: mockToken }
});

// ==========================================
// 2. LOGIC DI CHUYỂN & CẬP NHẬT TỌA ĐỘ
// ==========================================
socket.on("connect", () => {
    console.log(`✅ [DRIVER] Kết nối thành công! Socket ID: ${socket.id}`);

    // Vị trí xuất phát (gần quán ăn để geosearch quét trúng)
    let currentLng = 106.6297;
    let currentLat = 10.8231;

    // Bắn tọa độ định kỳ lên Redis mỗi 5 giây
    const moveInterval = setInterval(() => {
        currentLng += 0.0002; 
        currentLat += 0.0002; 

        console.log(`📍 [GPS] Đang chạy xe - Tọa độ: Lng: ${currentLng.toFixed(4)}, Lat: ${currentLat.toFixed(4)}`);
        
        socket.emit("driver:update_location", {
            longitude: currentLng,
            latitude: currentLat,
            cityId: "DAD" // Phải khớp với cityId lúc khách đặt đơn
        });
    }, 5000);
});

// ==========================================
// 3. LẮNG NGHE SỰ KIỆN TỪ SERVER (QUAN TRỌNG)
// ==========================================

// LẮNG NGHE ĐƠN HÀNG ĐƯỢC ĐIỀU PHỐI ĐẾN (Từ hàm sendOrderToNextDriver của BE)
socket.on("driver:ping_new_order", (data) => {
    const { orderId, restaurantName } = data;
    console.log(`\n🔔 [TIẾNG CHUÔNG] Đơn hàng mới từ nhà hàng: ${restaurantName} (ID: ${orderId})`);
    console.log(`⏱️ Bạn có 15 giây để suy nghĩ bấm nhận đơn...`);

    // Giả lập: Tài xế suy nghĩ mất 2 giây rồi bấm "NHẬN ĐƠN"
    setTimeout(() => {
        console.log(`👉 [ACTION] Tài xế bấm nút [NHẬN ĐƠN] cho đơn hàng: ${orderId}`);
        
        // ĐÃ FIX: Gửi đúng cấu trúc Object { driverId, orderId } như Backend yêu cầu
        socket.emit("driver:accept_order", {
            driverId: mockDriverId,
            orderId: orderId
        });
    }, 2000);
});

// Nhận đơn thành công
socket.on("driver:accept_success", (data) => {
    console.log(`🎉 [SUCCESS] Hệ thống xác nhận đơn thuộc về bạn! Trạng thái đơn: ${data.status}`);
});

// Xử lý lỗi từ server trả về
socket.on("order:error", (error) => {
    console.error(`❌ [ERROR] Lỗi xử lý:`, error.message);
});

socket.on("connect_error", (err) => {
    console.error("❌ [AUTH FAILED] Không thể qua cửa xác thực:", err.message);
});

socket.on("disconnect", () => {
    console.log("🔌 Tài xế đã tắt app (Ngắt kết nối).");
});