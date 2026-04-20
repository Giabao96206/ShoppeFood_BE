import { Request, Response } from "express";
import User from "../model/User.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Document } from "mongoose";
import { access } from "node:fs";

interface IUser extends Document {
  name?: string;
  email: string;
  password: string;
  isActive?: boolean;
  avatar?: string;
  role?: string;
  phone?: string;
}
export const Login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    const user: IUser | null = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ status: "401", message: "Sai tài khoản hoặc mật khẩu" });
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
      {
        userID: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        phone: user.phone,
      },
      SECRET_KEY,
      { expiresIn: "1h" },
    );

    return res.status(200).json({
      status: "200",
      message: "Đăng nhập thành công!",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
        access_token: token,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "500", message: "Server error" });
  }
};

export const CheckAccount = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Chưa có token" });
  }
  console.log(authHeader);

  if (!authHeader) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  const token: string = authHeader.split(" ")[1] || "";
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    console.log(decoded);

    return res.status(200).json({
      status: "200",
      message: "Token hợp lệ",
      data: {
        user: decoded,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "500", message: "Server error" });
  }
};
