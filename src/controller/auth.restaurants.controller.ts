import { Request, Response } from "express";
import restaurants from "../model/restaurants.model";
import { Document, Types } from "mongoose";
import menus from "../model/Menu.model";
import menuitems from "../model/MenuItems.model";

interface IOptions {
  title: string;
  description: string;
  additionalPrice: number;
}

interface IRestaurants extends Document {
  name: string;
  phone: string;
  address: string;
  email: string;
  rating: number;
  image: string;
  isActive: boolean;
}

interface IMenu extends Document {
  restaurants: string;
  title: string;
}

interface IMenuItems extends Document {
  menu: Types.ObjectId;
  title: string;
  description: string;
  basePrice: number;
  image: string;
  options: IOptions[];
}
export const TopRating = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  // await new Promise((resolve) => setTimeout(resolve, ));
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

export const MenuRestaurant = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;

    // await new Promise((resolve) => setTimeout(resolve, 5000));

    const restaurant = await restaurants.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        status: "404",
        message: "Restaurant not found",
      });
    }

    const menusList = await menus.find({
      restaurant: restaurant._id,
    });

    if (!menusList || menusList.length === 0) {
      return res.status(404).json({
        status: "404",
        message: "Menu not found",
      });
    }

    const menusWithItems = await Promise.all(
      menusList.map(async (menu) => {
        const menuItems = await menuitems.find({
          menu: menu._id,
        });

        console.log(menuItems);

        return {
          _id: menu._id,
          title: menu.title,
          restaurant: menu.restaurants,
          menuItems,
        };
      }),
    );

    return res.status(200).json({
      message: "Success",
      status: "200",
      data: {
        _id: restaurant._id,
        name: restaurant.name,
        phone: restaurant.phone,
        email: restaurant.email,
        address: restaurant.address,
        rating: restaurant.rating,
        image: restaurant.image,
        menus: menusWithItems,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "500",
      message: "Server error",
    });
  }
};
