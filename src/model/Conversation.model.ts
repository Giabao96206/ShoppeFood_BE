import mongoose, { Schema } from "mongoose";

const ConversationSchema = new Schema({
  // Mảng chứa ID của 2 người tham gia trò chuyện
  participants: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  }],
  
  // Dư thừa dữ liệu (Denormalization) để tối ưu tốc độ đọc màn hình Inbox
  last_message: {
    message_id: { type: Schema.Types.ObjectId, ref: 'Message' },
    sender_id: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    is_read: { type: Boolean, default: false },
    createdAt: { type: Date }
  },
  backgroundImage: {
    type: String,
    default: null,
    require: false,
  }
}, { 
  timestamps: true 
});

// THỦ THUẬT ĐÁNH INDEX QUAN TRỌNG:
// Phục vụ câu query: "Lấy danh sách inbox của user_id = X, sắp xếp theo thời gian mới nhất"
ConversationSchema.index({ participants: 1, updatedAt: -1 });

export const Conversation = mongoose.model('Conversation', ConversationSchema);