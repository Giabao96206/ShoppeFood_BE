import express from "express";
import { CancelOrder } from "../controller/auth.order.controller";
import { validateOrder } from "../middleware/order.middleware";

const router = express.Router();

router.post("/", validateOrder, CancelOrder);

export default router;
