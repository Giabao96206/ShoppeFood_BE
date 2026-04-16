import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../model/User.model";
import VerificationCode from "../model/Code.model";
import { sendVerificationEmail } from "../utils/mailer";
interface User {
  name: string;
  email: string;
  password: string;
}

export const getAllUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const users: User[] = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "500", message: "Internal server error" });
  }
};
