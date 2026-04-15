import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database";
import routes from "./routers/index.routers";
// Load biến môi trường
dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
routes(app);

// Kết nối DB và chạy server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  });
});
