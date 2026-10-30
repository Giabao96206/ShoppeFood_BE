import express from "express";
import { getConversation } from "../controller/GetAllUser.controller";

const router = express.Router();

router.post("/", getConversation);

export default router;
