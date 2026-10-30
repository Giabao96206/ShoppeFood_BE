import express from "express";
import { CancelOrder } from "../controller/auth.order.controller";

const router = express.Router();

router.post("/", CancelOrder);

export default router;
