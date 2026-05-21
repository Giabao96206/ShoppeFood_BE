import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai'; 
import MenuItems from './model/MenuItems.model';
import connectDB from './config/database';


dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MONGODB_URI = process.env.MONGODB_URI || '';

// Khởi tạo Google Gen AI Client thế hệ mới
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function migrateEmbeddings() {
  try {
   connectDB();

    // === TỰ ĐỘNG QUÉT DANH SÁCH MODEL KHẢ DỤNG ===
    console.log("🔍 Đang quét danh sách các model Vector có sẵn trong tài khoản của bạn...");
    try {
      const response = await ai.models.list() as any; 
      console.log("\n📋 --- DANH SÁCH MODEL VECTOR BẠN ĐƯỢC PHÉP DÙNG ---");
      for await (const m of response) {
        if (m.name?.includes('embed')) {
          console.log(`👉 Model khả dụng: '${m.name?.replace('models/', '')}'`);
        }
      }
      console.log("---------------------------------------------------\n");
    } catch (listError) {
      console.log("⚠️ Không thể tự động liệt kê model, hệ thống vẫn tiếp tục chạy...");
    }

    // Tìm các món ăn trong Database chưa được nạp Vector AI
    const itemsNeedEmbedding = await MenuItems.find({
      $or: [
        { food_embedding: { $exists: false } },
        { food_embedding: { $size: 0 } }
      ]
    });

    console.log(`🤖 Tìm thấy ${itemsNeedEmbedding.length} món ăn cần nạp dữ liệu AI.`);

    for (let item of itemsNeedEmbedding) {
      console.log(`⏳ Đang lấy Vector cho: ${item.title}...`);
      
      // Tổng hợp dữ liệu văn bản để AI "đọc" hiểu món ăn
      const textToEmbed = `Món ăn: ${item.title}. ${item.description || ''}`;

      // Gọi API bằng model chính xác đã được Google cấp quyền cho Key của bạn
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-2', 
        contents: textToEmbed,
      });

      // Trích xuất mảng Vector (embeddings[0].values) với kiểm tra an toàn từ TS
      const embeddingVector = response.embeddings?.[0]?.values;

      if (!embeddingVector) {
        console.error(`❌ Không thể trích xuất Vector cho món: ${item.title}`);
        continue; // Bỏ qua món lỗi, không làm sập toàn bộ tiến trình
      }

      // Gán mảng vector vào document
      item.food_embedding = embeddingVector;
      
      // Lưu lại vào MongoDB (Thêm validateBeforeSave để an toàn tuyệt đối)
      await item.save({ validateBeforeSave: false });
      
      console.log(`✅ Đã cập nhật xong: ${item.title}`);
      
      // Nghỉ 500ms giữa các vòng lặp tránh vượt giới hạn lượt gọi API (Rate Limit)
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log("\n🎉 [THÀNH CÔNG] Toàn bộ database đã được thông nạp AI hoàn tất!");
    process.exit(0);
  } catch (error) {
    console.error("💥 Quá trình chạy gặp lỗi chí mạng:", error);
    process.exit(1);
  }
}

migrateEmbeddings();