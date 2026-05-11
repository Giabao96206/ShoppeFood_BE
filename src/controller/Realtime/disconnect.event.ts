import { Socket } from "socket.io";
import { handleDisconnect } from "../Messages.controller";

export const registerDisconnectEvent = (
  socket: Socket
) => {
  socket.on("disconnect", () => {
    const userId = socket.data.userId;
    handleDisconnect(userId, new Date());
    socket.leave(userId);
    console.log(`User disconnected: ${userId}`);
  });
};