import express from "express";
import { Login } from "../controller/auth.login.controller";

const router = express.Router();

router.post("/", Login);

export default router;
