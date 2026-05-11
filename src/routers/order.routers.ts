import express from "express";
import { createOrder } from "../controller/auth.order.controller";
import { validateOrder } from "../middleware/order.middleware";

const router = express.Router();

router.post("/", validateOrder, createOrder);

export default router;
