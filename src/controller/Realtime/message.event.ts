import { Socket, Server } from "socket.io";
import { sendMessage } from "../Messages.controller";

export const registerMessageEvent = (io: Server, socket: Socket) => {
  socket.on(
    "send_message",
    async (payload: { receiverId: string; content: string; tempId?: string }) => {
      try {
        const userId = socket.data.userId;

        const savedMessage = await sendMessage({
          senderId: userId,
          receiverId: payload.receiverId,
          content: payload.content,
        });

        const messageResponse = {
          ...savedMessage.toObject?.() || savedMessage,
          tempId: payload.tempId, // 👈 QUAN TRỌNG
        };

        // ==========================
        // gửi cho NGƯỜI NHẬN
        // ==========================
        io.to(payload.receiverId).emit(
          "receive_new_message",
          savedMessage
        );

        // ==========================
        // gửi cho NGƯỜI GỬI (replace temp message)
        // ==========================
        socket.emit(
          "message_sent_success",
          messageResponse
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