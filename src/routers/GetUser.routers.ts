import express from "express";
import { getAllUser } from "../controller/GetAllUser.controller";

const router = express.Router();

router.get("/", getAllUser);

export default router;
