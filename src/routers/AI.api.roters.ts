import express from "express";
import { GetAI } from "../controller/AI/ask.api.controller";
import { searchFoodByAI } from "../controller/AI/aiSearchController";


export const router = express.Router();
router.post("/", GetAI);

export const routerFoodAI = express.Router();
routerFoodAI.post("/", searchFoodByAI);

