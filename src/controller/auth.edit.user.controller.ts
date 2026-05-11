
import { Request, Response } from "express";
import User from "../model/User.model";

interface IEdit {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}
export const EditUser = async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File;
    console.log(file);
    

    const { name, email, phone } = req.body;
    const userId = req.user!.userID;

    const updateData: any = {};

    if (name?.trim()) updateData.name = name;
    if (email?.trim()) updateData.email = email;
    if (phone?.trim()) updateData.phone = phone;

    // avatar
    if (file) {
      updateData.avatar = file.path;
    }

    console.log(updateData);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    return res.status(200).json({
      message: "User updated successfully",
      user: {
        name: updatedUser?.name,
        email: updatedUser?.email,
        phone: updatedUser?.phone,
        avatar: updatedUser?.avatar,
        role: updatedUser?.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};