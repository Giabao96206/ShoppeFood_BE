import { Request, Response } from "express";
import { Conversation } from "../model/Conversation.model";
interface User {
  _id: string;
  name: string;
  email: string;
}

export const getConversation = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const userId = req.user!.userID;

    const conversations = await Conversation.find({
      participants: userId,
    }).populate("participants", "name avatar last_seen");

    const result = conversations.map((conv: any) => {
      const otherUser = conv.participants.find(
        (p: any) => p._id.toString() !== userId.toString()
      );

      return {
        _id: conv._id,
        otherUser,
        lastMessage: conv.last_message,
        backgroundImage: conv.backgroundImage,
      };
    });

    return res.status(200).json({
      status: "200",
      message: "Success",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "500", message: "Internal server error" });
  }
};