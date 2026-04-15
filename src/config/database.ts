import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("Thiếu MONGO_URL trong .env");
    }

    await mongoose.connect(process.env.MONGO_URL);

    console.log("✅ Kết nối database thành công!");
  } catch (error) {
    console.error("❌ Kết nối database thất bại!", error);
    process.exit(1); // 👉 thoát app nếu lỗi
  }
};

export default connectDB;
