import { Request, Response } from "express";
import User from "../model/User.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Document } from "mongoose";

interface IUser extends Document {
  name?: string;
  email: string;
  password: string;
  isActive?: boolean;
  avatar?: string;
}
export const Login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    const user: IUser | null = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Tài khoản chưa được kích hoạt, vui lòng kiểm tra email!",
        status: "403",
      });
    }

    const SECRET_KEY = process.env.JWT_SECRET;
    if (!SECRET_KEY) {
      return res.status(500).json({ message: "Missing SECRET_KEY" });
    }

    const token = jwt.sign(
      { userID: user._id, email: user.email },
      SECRET_KEY,
      { expiresIn: "30d" },
    );

    return res.status(200).json({
      message: "Đăng nhập thành công!",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "500", message: "Server error" });
  }
};
