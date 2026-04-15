import express from "express";
import { register } from "../controller/auth.signup.controller";
import { validateRegister } from "../middleware/validateRegister";
import { uploadCloud } from "../config/cloudinary";

const router = express.Router();

router.post("/", uploadCloud.single("avatar"), validateRegister, register);

export default router;
