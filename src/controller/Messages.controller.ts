import mongoose, { Document, Types } from "mongoose";
import { Conversation } from '../model/Conversation.model';
import {Message} from '../model/Message.model';

import { Request, Response } from 'express';
import User from '../model/User.model';
// Định nghĩa kiểu dữ liệu đầu vào
interface SendMessageDTO {
  senderId: string;
  receiverId: string;
  content: string;
  replyToMessageId?: string| null;
}

export const sendMessage = async ({ senderId, receiverId, content, replyToMessageId }: SendMessageDTO) => {
  try {
  
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });


    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        // last_message ban đầu để trống, sẽ update ở bước sau
      });
    }

    // 3. Tạo document Tin nhắn mới
    const newMessage = await Message.create({
      conversation_id: conversation._id,
      sender_id: senderId,
      content: content,
      status: 'sent',
      reply_to: replyToMessageId
    ? new mongoose.Types.ObjectId(replyToMessageId)
    : null,
    });


    // 4. Cập nhật last_message vào Conversation
    // Sử dụng findByIdAndUpdate để tối ưu tốc độ ghi
    await Conversation.findByIdAndUpdate(
      conversation._id,
      {
        last_message: {
          message_id: newMessage._id,
          sender_id: senderId,
          content: content,
          is_read: false,
          createdAt: newMessage.createdAt
        }
      },
      { new: true } // Trả về document sau khi đã update
    );

    // Trả về tin nhắn vừa tạo để Controller gửi qua API hoặc qua WebSocket
    return newMessage;

  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    throw new Error("Không thể gửi tin nhắn lúc này");
  }
};

export const getUserInbox = async (userId: string) => {
  try {
    // Truy vấn tất cả cuộc trò chuyện mà userId có nằm trong mảng participants
    const inbox = await Conversation.find({
      participants: userId 
    })
    // Populate (điền thông tin) user để lấy tên và avatar của người đang chat cùng
    .populate({
      path: 'participants',
      select: 'username avatar_url', // Chỉ lấy các field cần thiết
      match: { _id: { $ne: userId } } // Không lấy thông tin của chính user đang request
    })
    // Sắp xếp theo thời gian có tin nhắn mới nhất giảm dần
    .sort({ updatedAt: -1 }) 
    // Phân trang (Pagination) - Ví dụ lấy 20 cuộc trò chuyện đầu tiên
    .limit(20) 
    .lean(); // Biến Mongoose Document thành Plain Javascript Object để xử lý nhanh hơn

    return inbox;

  } catch (error) {
    console.error("Lỗi khi tải inbox:", error);
    throw new Error("Không thể tải danh sách hộp thư");
  }
};

// import { sendMessage, getUserInbox } from './chat.service';

export const handleSendMessage = async (req: Request, res: Response) => {
  try {
    const { receiverId, content } = req.body;
    
    const senderId = req.user!._id; // Giả sử ID người gửi lấy từ middleware xác thực (JWT)

    const message = await sendMessage({ senderId, receiverId, content });
    
    // Nếu dùng Socket.io, bạn có thể emit sự kiện gửi tin nhắn ở đây
    // io.to(receiverId).emit('receive_message', message);

    res.status(200).json({ success: true, data: message });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleDisconnect = async (userID: string, last_seen: Date) => {
  try {
    await User.findByIdAndUpdate(userID, { last_seen });
    return true;
  } catch(err) { 
    console.error("Lỗi cập nhật last_seen:", err);
    return false;
  }
}


interface Messages extends Document {
  conversation_id: Types.ObjectId;
  sender_id: Types.ObjectId;
  content: string;
  status: "sent" | "read";
}

export const GetAllMessage = async (req: Request, res: Response) : Promise<Response> => {
  try {
   const { conversationId } = req.body;
   console.log(conversationId);
   
  if (!conversationId || Array.isArray(conversationId)) {
   return res.status(400).json({
    message: "conversationId không hợp lệ",
  });
}
  const messages = await Message.find({
  conversation_id: new Types.ObjectId(conversationId),
 })
  .sort({ createdAt: -1 }) // mới nhất trước
  .limit(20); // lấy 20 tin nhắn gần nhất
    return res.status(200).json({
      message: "Success",
      status: "200",
      data: messages,
    })
  } catch (err) {
    return res.status(500).json({
      message: "Lỗi server",
    });
  
  }
}


export const GetMoreMessages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { conversationId } = req.params;


    const { cursor, limit = 20 } = req.query;
    console.log(cursor);

    if (!conversationId || Array.isArray(conversationId)) {
      return res.status(400).json({
        message: "conversationId không hợp lệ",
      });
    }

    const query: any = {
      conversation_id: new Types.ObjectId(conversationId),
    };

    if (cursor && typeof cursor === "string") {
      const date = new Date(cursor);
      console.log(date);
      if (!isNaN(date.getTime())) {
        query.createdAt = {
          $lt: date,
        };
      }
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(4);

  return res.status(200).json({
      message: "Success",
      status: "200",
      data: messages,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};


export const PushToken = async (req: Request, res: Response) : Promise<Response> => {
  const { userId, token } = req.body;
  try {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { expoPushTokens: token } 
    });
   return  res.status(200).json({ message: "Đã lưu token thành công!" });
  } catch (error) {
   return  res.status(500).json({ error: "Lỗi server" });
  }
}



interface IEdit {
  backgroundImage?: string;
}

export const EditMess = async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File;
    const { _id } = req.body;
    if (!_id) {
  return res.status(400).json({ message: "_id is required" });
}
    console.log(_id);

    const updateData: IEdit = {};

    if (file) {
      updateData.backgroundImage = file.path;
    }
     const data =   await Conversation.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true }
    );

    if(data) {
      console.log(data);
    }

    return res.json({
      status:  "200",
      message: "Conversation updated successfully",
      data: data!.backgroundImage
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};