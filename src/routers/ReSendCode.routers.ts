import express from "express";

import { ValiDateReSendCode } from "../middleware/validateResendCode";
import { resendCode } from "../controller/auth.signup.controller";

const router = express.Router();

router.post("/", ValiDateReSendCode, resendCode);

export default router;
