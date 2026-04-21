import { Request, Response } from "express";
import restaurants from "../model/restaurants.model";
import { Document } from "mongoose";

interface IRestaurants extends Document {
  name: string;
  phone: string;
  address: string;
  email: string;
  rating: number;
  image: string;
  isActive: boolean;
}
export const TopRating = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const topRestaurants = await restaurants.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 10 } },
    ]);
    return res.status(200).json({
      message: "Success",
      status: "200",
      data: topRestaurants,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "500", message: "Server error" });
  }
};
