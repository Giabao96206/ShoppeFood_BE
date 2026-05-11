    import { Socket, Server } from "socket.io";
import { Conversation } from '../../model/Conversation.model';
import {Message} from '../../model/Message.model';

export const registerReadEvent = (
  io: Server,
  socket: Socket
) => {
  socket.on(
    "mark_as_read",
    async (payload: {
      conversationId: string;
      messageId: string;
      senderId: string;
    }) => {
      try {
        await Message.findByIdAndUpdate(
          payload.messageId,
          {
            status: "read",
          }
        );

        await Conversation.findOneAndUpdate(
          {
            _id: payload.conversationId,
            "last_message.message_id":
              payload.messageId,
          },
          {
            $set: {
              "last_message.is_read": true,
            },
          }
        );

        io.to(payload.senderId).emit(
          "message_seen",
          {
            conversationId:
              payload.conversationId,
            messageId: payload.messageId,
          }
        );
      } catch (error) {
        console.log(error);
      }
    }
  );
};