import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../model/User.model";
import VerificationCode from "../model/Code.model";
import { sendVerificationEmail } from "../utils/mailer";
interface IUser {
  name: string;
  email: string;
  password: string;
  isActive?: boolean;
  avatar?: string;
}
export const register = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { name, email, password }: IUser = req.body;
    console.log(name, email, password);

    const avatarUrl = req.file
      ? req.file.path
      : "https://res.cloudinary.com/doppezovj/image/upload/v1776220896/ava_bounap.png";
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      avatar: avatarUrl,
    });

    await newUser.save();
    const code: string = Math.floor(100000 + Math.random() * 900000).toString();
    const newCode = new VerificationCode({ email, code });
    await newCode.save();

    await sendVerificationEmail(email, code);

    console.log("Tạo tài khoản thanh cong!");

    return res.status(201).json({
      message:
        "Tạo tài khoản thành công, vui lòng kiểm tra email để nhận mã kích hoạt.",
      status: "201",
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isActivated: newUser.isActive,
        avatar: newUser.avatar,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi từ phía Server!",
      error: err,
      status: "500",
    });
  }
};

export const activateAccount = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { email, code }: { email: string; code: string } = req.body;

    const validCode = await VerificationCode.findOne({ email, code });
    if (!validCode) {
      return res.status(400).json({
        message: "Mã xác nhận không đúng hoặc đã hết hạn!",
        status: "400",
      });
    }

    await User.findOneAndUpdate(
      { email },
      { $set: { isActive: true } },
      { new: true },
    );

    await VerificationCode.deleteOne({ _id: validCode._id });
    return res.status(200).json({
      message: "Kích hoạt tài khoản thành công!",
      status: "200",
      data: {
        _id: validCode._id,
        email: validCode.email,
        code: validCode.code,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi Server!", error });
  }
};

// ... (Các hàm register, activateAccount, login giữ nguyên)

export const resendCode = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email }: { email: string } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "404",
        message: "Không tìm thấy tài khoản với email này!",
      });
    }

    if (user?.isActive) {
      return res.status(400).json({
        status: "400",
        message: "Tài khoản của bạn đã được kích hoạt từ trước!",
      });
    }

    await VerificationCode.deleteMany({ email });

    const Newcode: string = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const savedCode = new VerificationCode({ email, code: Newcode });
    await savedCode.save();

    await sendVerificationEmail(email, Newcode);
    return res.status(200).json({
      status: "200",
      message: "Mã xác nhận mới đã được gửi. Vui lòng kiểm tra email của bạn!",
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi Server!", error });
  }
};
