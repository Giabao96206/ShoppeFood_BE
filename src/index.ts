import express, { Request } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database";
import routes from "./routers/index.routers";
import path from "path";

dotenv.config();
const app = express();

app.use("/images", express.static(path.join(__dirname, "../src/images")));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

routes(app);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  });
});
