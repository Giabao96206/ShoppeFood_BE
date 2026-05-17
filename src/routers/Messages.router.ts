import express from "express";
import { GetAllMessage, GetMoreMessages } from "../controller/Messages.controller";

export const router = express.Router();
router.post("/", GetAllMessage);

// 
export const routerGetMM = express.Router();
routerGetMM.get("/:conversationId", GetMoreMessages);

