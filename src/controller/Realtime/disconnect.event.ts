import { Server, Socket } from "socket.io";
import { handleDisconnect } from "../Messages.controller";

export const registerDisconnectEvent = (
  io: Server, // Nhận io để emit (nếu cần gửi toàn cục)
  socket: Socket,
  onLineUsers: Map<string, string> // Nhận biến Map
) => {
  socket.on("disconnect", async () => {
    const userId = socket.data.userId;
    const last_seen = new Date();

    await handleDisconnect(userId, last_seen);
    onLineUsers.delete(userId);
    socket.broadcast.emit("user_offline", {
      userId: userId,
      last_seen: last_seen
    });
    console.log(`User disconnected: ${userId} at ${last_seen}`);
  });
};