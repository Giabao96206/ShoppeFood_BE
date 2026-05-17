import { GoogleGenerativeAI } from "@google/generative-ai";
import { Request, Response } from "express";

// API KEY của bạn
const genAI = new GoogleGenerativeAI("AIzaSyDudrj7HyVUgJI_qciDUKSH7QtE39rlxTc");

async function askAI(question: any) {

    // chọn model
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
    });

    // gửi câu hỏi
    const result = await model.generateContent(question);

    // lấy text trả về
    const response = result.response.text();

    return response;
}


export const GetAI = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { questions } = req.body;
        console.log(questions);
        
        const response = await askAI(questions);
        console.log(response);
        
        return res.status(200).json({ status: "200", message: "Success", data: response})
    } catch(err) {
        return res.status(500).json({ status: "500", message: "Server error" }); 
    }
}