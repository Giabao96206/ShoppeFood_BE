import express from "express";
import { createOrder } from "../controller/auth.order.controller";

const router = express.Router();

router.post("/", createOrder);

export default router;
