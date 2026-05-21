import { GoogleGenAI } from "@google/genai";
import { Request, Response } from "express";
import MenuItems from "../../model/MenuItems.model";


// Khởi tạo Google Gen AI với API Key từ file .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const searchFoodByAI = async (req: Request, res: Response): Promise<Response | any> => {
    try {
      
        const { preference } = req.body; 
        

        if (!preference || preference.trim() === "") {
            return res.status(400).json({ 
                status: "400", 
                message: "Vui lòng nhập món ăn hoặc sở thích bạn muốn tìm kiếm!" 
            });
        }

        console.log(`🔍 Người dùng đang tìm kiếm: "${preference}"`);

        // 1. Gọi Gemini API để biến câu sở thích thành Vector 3072 chiều
        const aiResponse = await ai.models.embedContent({
            model: "gemini-embedding-2", // Đúng model tài khoản của bạn được cấp quyền
            contents: preference,
        });

        const queryVector = aiResponse.embeddings?.[0]?.values;

        if (!queryVector) {
            return res.status(500).json({ 
                status: "500", 
                message: "Không thể phân tích ngữ nghĩa của câu tìm kiếm này." 
            });
        }

        // 2. Query vào Database bằng Vector Search Index của MongoDB Atlas
        const suggestedFoods = await MenuItems.aggregate([
            {
                "$vectorSearch": {
                    "index": "vector_index",      // Tên Index bạn vừa đặt trên MongoDB Atlas
                    "path": "food_embedding",     // Trường chứa mảng 3072 số trong DB
                    "queryVector": queryVector,   // Mảng 3072 số vừa lấy từ Gemini ở trên
                    "numCandidates": 100,         // Số lượng món đem ra so sánh (Dự án bạn có 86 món nên để 100 là quét hết sạch)
                    "limit": 5                    // Lấy ra top 5 món phù hợp nhất với sở thích
                }
            },
            {
                // 3. Project: Chỉ lấy các trường cần thiết trả về cho App/Web, 
                // Ẩn trường "food_embedding" đi để giảm dung lượng data truyền tải.
                "$project": {
                    "menu": 1,
                    "title": 1,
                    "description": 1,
                    "basePrice": 1,
                    "image": 1,
                    "options": 1,
                    "score": { "$meta": "vectorSearchScore" } // Trả về điểm số độ khớp AI (Càng gần 1 càng chuẩn)
                }
            }
        ]);

        console.log(`✅ Tìm thấy ${suggestedFoods.length} món ăn phù hợp.`);

        // 4. Trả kết quả về cho Frontend
        return res.status(200).json({
            status: "200",
            message: "Tìm kiếm bằng trí tuệ nhân tạo thành công!",
            data: suggestedFoods
        });

    } catch (error) {
        console.error("💥 Lỗi xử lý Vector Search:", error);
        return res.status(500).json({ 
            status: "500", 
            message: "Lỗi máy chủ khi tìm kiếm bằng AI." 
        });
    }
};