import { Request, Response } from "express";
import User from "../model/User.model";
import bcrypt from "bcryptjs";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { Document } from "mongoose";

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
        role: user.role,
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
  try {
    const userId = req.user?.userID;

    if (!userId) {
       return res.status(401).json({ message: "User not found in token" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      status: "200",
      message: "Token hợp lệ",
      data: {
        user: user,
      },
    });
  } catch (err) {
    return res.status(500).json({ status: "500", message: "Server error" });
  }
};
