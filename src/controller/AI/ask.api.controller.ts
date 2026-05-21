import { GoogleGenAI } from "@google/genai";
import { Request, Response } from "express";

const apiKey = "AIzaSyDudrj7HyVUgJI_qciDUKSH7QtE39rlxTc"; 

// 1. Khởi tạo client bằng thư viện mới
const ai = new GoogleGenAI({ apiKey: apiKey });

async function askAI(question: string) {
    // 2. Cú pháp gọi model mới gộp chung model và nội dung vào một object
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: question
    });

    // 3. Lấy text trả về (Lưu ý: ở SDK mới, 'text' là thuộc tính (getter), không còn là hàm có ngoặc () nữa)
    return response.text;
}

export const GetAI = async (req: Request, res: Response): Promise<Response | any> => {
    try {
        const { questions } = req.body;
        console.log("Câu hỏi nhận được:", questions);
        
       
        if (!questions) {
             return res.status(400).json({ status: "400", message: "Missing 'questions' in request body" });
        }
        
        const aiResponse = await askAI(questions);
        console.log("AI Trả lời:", aiResponse);
        
        return res.status(200).json({ status: "200", message: "Success", data: aiResponse });
    } catch(err) {
        console.error("💥 Lỗi khi gọi AI:", err);
        return res.status(500).json({ status: "500", message: "Server error" }); 
    }
}