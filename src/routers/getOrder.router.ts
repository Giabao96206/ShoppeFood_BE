import express from "express";
import { getLastOrder } from "../controller/auth.order.controller";
import { validateOrder } from "../middleware/order.middleware";

const router = express.Router();

router.get("/", validateOrder, getLastOrder);

export default router;
