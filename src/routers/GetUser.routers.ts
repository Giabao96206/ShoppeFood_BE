import express from "express";
import { getConversation } from "../controller/GetAllUser.controller";
import { validateOrder } from "../middleware/order.middleware";

const router = express.Router();

router.post("/", validateOrder,  getConversation);

export default router;
