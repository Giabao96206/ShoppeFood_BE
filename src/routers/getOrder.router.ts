import express from "express";
import { getLastOrder } from "../controller/auth.order.controller";

const router = express.Router();

router.get("/", getLastOrder);

export default router;
