import mongoose, { Schema, model, models, Model, Types } from "mongoose";

interface IOptions {
  title: string;
  description: string;
  additionalPrice: number;
}

interface IMenuItems {
  menu: Types.ObjectId;
  title: string;
  description: string;
  basePrice: number;
  image: string;
  options: IOptions[];
  food_embedding?: number[];
}

const optionSchema = new Schema<IOptions>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    additionalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false },
);

const menuItemsSchema = new Schema<IMenuItems>(
  {
    menu: {
      type: Schema.Types.ObjectId,
      ref: "menus",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false, // Thay đổi: Không bắt buộc dữ liệu cũ phải có mô tả
      default: "",     // Tự động điền chuỗi rỗng nếu trống
      trim: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: true,
    },
    options: {
      type: [optionSchema],
      default: [],
    },
    food_embedding: {
      type: [Number],
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const MenuItems: Model<IMenuItems> =
  models.menuitems || model<IMenuItems>("menuitems", menuItemsSchema);

export default MenuItems;