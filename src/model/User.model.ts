import mongoose, { Schema, model, models } from "mongoose";

interface IUser {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  avatar: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/doppezovj/image/upload/v1776220896/ava_bounap.png",
    },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const User = models.User || model<IUser>("User", userSchema);

export default User;
