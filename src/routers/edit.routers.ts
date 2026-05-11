import express from "express";
import { EditUser } from "../controller/auth.edit.user.controller";
import { validateOrder } from "../middleware/order.middleware";
import { uploadMiddleware } from "../middleware/upload.middleware";

const router = express.Router();

router.post("/", validateOrder,   uploadMiddleware.single("avatar"), EditUser);

export default router;
