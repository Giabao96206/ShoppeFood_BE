import mongoose, { Schema, model, models, Model, Types } from "mongoose";
interface menuitems {
  menu: Types.ObjectId;
  title: string;
  description: string;
  basePrice: number;
  image: string;
  options: string[];
}

const restaurantsSchema = new Schema<menuitems>(
  {
    menu: { type: Types.ObjectId, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true },
    image: { type: String, required: true },
    options: { type: [String], default: [] },
  },
  { timestamps: true },
);

const menuitems =
  (mongoose.models.menuitems as Model<menuitems>) ||
  mongoose.model("menuitems", restaurantsSchema);

export default menuitems;
