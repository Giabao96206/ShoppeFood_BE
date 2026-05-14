import express from "express";
import { GetAI } from "../controller/AI/ask.api.controller";


const router = express.Router();

router.post("/", GetAI);

export default router;
