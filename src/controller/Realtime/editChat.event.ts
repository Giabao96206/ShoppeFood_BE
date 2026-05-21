import { Socket, Server } from "socket.io";
import { sendMessage } from "../Messages.controller";
import User from "../../model/User.model";
import { sendChatNotification } from "../pushNotification";

export const registerEdit = (io: Server, socket: Socket) => {
  socket.on("update_chat_wallpaper", async (payload: { receiverId: string, backgroundImage: string, conversationId: string }) => {
    console.log("User đổi hình nền:", payload);
    socket.to(payload.receiverId).emit("receive_chat_wallpaper", payload);
  });
};
