import express from "express";
import { register } from "../controller/auth.signup.controller";
import { validateRegister } from "../middleware/validateRegister";
import { uploadMiddleware } from "../middleware/upload.middleware";

const router = express.Router();

router.post(
  "/",
  uploadMiddleware.array("images", 5),
  validateRegister,
  register,
);

export default router;
