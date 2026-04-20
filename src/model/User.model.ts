import mongoose, { Schema, model, models, Model } from "mongoose"; // <-- Thêm Model vào import

interface IUser {
  name: string;
  email: string;
  phone?: string;
  password: string;
  isActive: boolean;
  avatar?: string;
  role?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: "" },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/doppezovj/image/upload/v1776220896/ava_bounap.png",
    },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// 👇 Ép kiểu rõ ràng tại đây 👇
const User = (models.User as Model<IUser>) || model<IUser>("User", userSchema);

export default User;
