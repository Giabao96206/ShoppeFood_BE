import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema({
  conversation_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Conversation', 
    required: true 
  },
  sender_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['sent', 'read'], // Chỉ cho phép 3 trạng thái này
    default: 'sent' 
  }
}, { 
  timestamps: true 
});

// THỦ THUẬT ĐÁNH INDEX QUAN TRỌNG:
// Phục vụ câu query: "Lấy 20 tin nhắn của conversation_id = X, sắp xếp từ mới nhất đến cũ nhất"
MessageSchema.index({ conversation_id: 1, createdAt: -1 });

export const Message = mongoose.model('Message', MessageSchema);