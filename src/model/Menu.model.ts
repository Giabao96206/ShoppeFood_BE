import mongoose, { Schema, model, models, Model, Types } from "mongoose";
interface menus {
  restaurants: Types.ObjectId;
  title: string;
}

const restaurantsSchema = new Schema<menus>(
  {
    restaurants: { type: Types.ObjectId, required: true },
    title: { type: String, required: true },
  },
  { timestamps: true },
);

const menus =
  (mongoose.models.menus as Model<menus>) ||
  mongoose.model("menus", restaurantsSchema);

export default menus;
