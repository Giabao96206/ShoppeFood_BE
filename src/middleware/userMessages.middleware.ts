import { Socket } from "socket.io";
import jwt, { TokenExpiredError } from "jsonwebtoken";

export const authSocketMiddleware = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  const token: string | undefined = socket.handshake.auth.access_token;

  if (!token) {
    return next(new Error("Không tìm thấy token xác thực"));
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    socket.data.userId = decoded.userID;
    socket.data.role = decoded.role || "user"; 
    next();
  } catch (error) {
    // Xử lý lỗi an toàn, gửi thông báo rõ ràng về cho Client
    if (error instanceof TokenExpiredError) {
      return next(new Error("Token đã hết hạn, vui lòng đăng nhập lại"));
    }
    return next(new Error("Token không hợp lệ"));
  }
};