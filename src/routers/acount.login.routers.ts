import express from "express";
import { CheckAccount } from "../controller/auth.login.controller";

const router = express.Router();

router.get("/", CheckAccount);

export default router;
