import express from "express";
import { EditUser } from "../controller/auth.edit.user.controller";
import { uploadMiddleware } from "../middleware/upload.middleware";

const router = express.Router();

router.post("/", uploadMiddleware.single("avatar"), EditUser);

export default router;
