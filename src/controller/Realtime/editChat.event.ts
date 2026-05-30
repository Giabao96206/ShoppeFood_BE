import { Socket, Server } from "socket.io";

export const registerEdit = (io: Server, socket: Socket) => {
  socket.on(
    "update_chat_wallpaper",
    async (payload: { receiverId: string; backgroundImage: string; conversationId: string }) => {
      console.log("User đổi hình nền:", payload);
      try {
        socket.to(payload.receiverId).emit("receive_chat_wallpaper", payload);
      } catch (error) {
        console.error("Lỗi khi đổi hình nền:", error);
      }
    }
  );
};