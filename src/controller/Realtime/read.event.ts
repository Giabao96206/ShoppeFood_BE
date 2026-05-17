import { Socket, Server } from "socket.io";
import { Conversation } from "../../model/Conversation.model";
import { Message } from "../../model/Message.model";

export const registerReadEvent = (
  io: Server,
  socket: Socket
) => {
  socket.on(
    "mark_as_read",
    async (payload: {
      conversationId: string;
      messageIds: string[];
      senderId: string;
    }) => {
      try {

        await Message.updateMany(
          {
            _id: { $in: payload.messageIds },
            status: { $ne: "read" },
          },
          {
            $set: {
              status: "read",
            },
          }
        );

        await Conversation.findByIdAndUpdate(
          payload.conversationId,
          {
            $set: {
              "last_message.is_read": true,
            },
          }
        );

        io.to(payload.senderId).emit(
          "message_seen",
          {
            conversationId: payload.conversationId,
            messageIds: payload.messageIds,
          }
        );

      } catch (error) {
        console.log(error);
      }
    }
  );
};