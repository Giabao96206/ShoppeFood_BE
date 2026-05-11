import { Socket } from "socket.io";
import jwt, { TokenExpiredError } from "jsonwebtoken";
export const authSocketMiddleware = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  const token: string | undefined= socket.handshake.auth.access_token;
 
  if (!token) {
    return next(new Error("Không tìm thấy userId"));
  }
   const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
   
  socket.data.userId = decoded.userID;

  next();
};