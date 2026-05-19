import { Socket, Server } from "socket.io";
import { sendMessage } from "../Messages.controller";
import User from "../../model/User.model";
import {sendChatNotification} from "../pushNotification"
export const registerMessageEvent = (io: Server, socket: Socket) => {
  socket.on(
    "send_message",
    async (payload: { receiverId: string; content: string; tempId?: string, name: string, avatar: string, replyToMessageId: string | null}) => {
      try {
        console.log(payload);

        const userId = socket.data.userId;

        const savedMessage = await sendMessage({
          senderId: userId,
          receiverId: payload.receiverId,
          content: payload.content,
          replyToMessageId: payload.replyToMessageId,   
        });

     
        const messageResponse = {
          ...savedMessage.toObject?.() || savedMessage,
          tempId: payload.tempId, 
        };

  
        io.to(payload.receiverId).emit(
          "receive_new_message",
          {
            ...messageResponse,
            name: payload.name,
            avatar: payload.avatar,
            replyToMessageId: payload.replyToMessageId,
          }
      );

      const receiver = await User.findById(payload.receiverId);
      
      if (receiver && receiver.expoPushTokens && receiver.expoPushTokens.length > 0) {
        
        await sendChatNotification(receiver.expoPushTokens, {
          name: payload.name, 
          content: payload.content,
          conversation_id: payload.tempId,
          avatar: payload.avatar
        });
        console.log("Đã bắn thông báo ngầm thành công!");
      }

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