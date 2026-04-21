import mongoose, { Schema, model, models, Model } from "mongoose";
interface restaurants {
  name: string;
  phone: string;
  address: string;
  email: string;
  rating: number;
  image: string;
  isActive: boolean;
}

const restaurantsSchema = new Schema<restaurants>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    rating: { type: Number, required: true },
    image: { type: String, required: true },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const restaurants =
  (mongoose.models.restaurants as Model<restaurants>) ||
  mongoose.model("restaurants", restaurantsSchema);

export default restaurants;
