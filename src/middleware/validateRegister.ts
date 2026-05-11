import { Request, Response, NextFunction } from "express";
import User from "../model/User.model";
interface Iuser {
  name: string;
  email: string;
  password: string;
}
export const validateRegister = async (
  req: Request,
  res: Respone,
  next: NextFunction,
) => {
  const { name, email, password }: Iuser = req.body;

  if (!req.body) {
    return res.status(400).json({ message: "Missing request body" });
  }

  if (!name || !email || !password) {
    console.log("Missing name, email, or password");
    return res.status(400).json({
      message: "Vui lòng nhập đầy đủ name, email, password",
    });
  }

  const emailExists = await User.findOne({ email } as any);
  if (emailExists) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Email không hợp lệ" });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password phải >= 6 ký tự",
    });
  }

  next();
};
