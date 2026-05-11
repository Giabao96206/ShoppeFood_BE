import { Socket, Server } from "socket.io";
import { sendMessage } from "../Messages.controller";

export const registerMessageEvent = (
  io: Server,
  socket: Socket
) => {
  socket.on(
    "send_message",
    async (payload: { receiverId: string; content: string }) => {
      try {
        const userId = socket.data.userId;

        const savedMessage = await sendMessage({
          senderId: userId,
          receiverId: payload.receiverId,
          content: payload.content,
        });

        io.to(payload.receiverId).emit(
          "receive_new_message",
          savedMessage
        );

        socket.emit(
          "message_sent_success",
          savedMessage
        );
      } catch (error) {
        console.log(error);

        socket.emit("error", {
          message: "Không thể gửi tin nhắn",
        });
      }
    }
  );
};