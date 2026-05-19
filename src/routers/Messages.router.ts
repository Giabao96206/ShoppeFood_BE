import express from "express";
import { GetAllMessage, GetMoreMessages, PushToken, EditMess } from "../controller/Messages.controller";
import { uploadMiddleware } from "../middleware/upload.middleware";

export const router = express.Router();
router.post("/", GetAllMessage);

// 
export const routerGetMM = express.Router();
routerGetMM.get("/:conversationId", GetMoreMessages);

export const routerPushtoken = express.Router();
routerPushtoken.post("/", PushToken);

export const routerEditMM = express.Router();
routerEditMM.post("/", uploadMiddleware.single("backgroundImage"), EditMess);