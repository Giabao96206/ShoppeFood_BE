import express from "express";
import { activateAccount } from "../controller/auth.signup.controller";
import { ValiDateCode } from "../middleware/validateCode";

const router = express.Router();

router.post("/", ValiDateCode, activateAccount);

export default router;
