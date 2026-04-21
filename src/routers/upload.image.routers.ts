import express from "express";
import { Upload } from "../controller/auth.uploadIMG.controller";
import { uploadMiddleware } from "../middleware/upload.middleware";

const router = express.Router();

router.post("/", uploadMiddleware.array("images", 10), Upload);

export default router;
