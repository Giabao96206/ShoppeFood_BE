import { Request, Response } from "express";
import Orders from "../model/order.model";
import restaurants from "../model/restaurants.model";

interface IDetails {
  image: string;
  option?: string;
  price: number;
  quantity: number;
  title: string;
}

interface CreateOrderDTO {
  restaurant: string;
  totalPrice: number;
  quantity: number;
  details: IDetails[];
}

export const createOrder = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { restaurant, totalPrice, quantity, details }: CreateOrderDTO =
      req.body;
    const userId = req.user?.userID;

    await Orders.create({
      restaurant,
      user: userId,
      totalPrice,
      quantity,
      details,
    });

    return res.status(201).json({
      message: "Tạo đơn hàng thành công",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

export const getLastOrder = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const userId = req.user?.userID;

    const MaplastOrder = await Orders.find({ user: userId, deleted: false}).sort({
      createdAt: -1,
    });

    const lastOrder = await Promise.all(
      MaplastOrder.map(async (order) => {
        const restaurant = await restaurants.findById(order.restaurant);
        return {
          ...order.toObject(),
          restaurantName: restaurant ? restaurant.name : "Unknown",
        };
      }),
    );

    if (!lastOrder || lastOrder.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng nào",
      });
    }
    return res.status(200).json({
      message: "Lấy đơn hàng thành công",
      status: "200",
      data: lastOrder,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

export const CancelOrder = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { OrderID } = req.body; 
    const userId = req.user?.userID;

    const order = await Orders.findById(OrderID);
    if(!order) {
      res.status(404).json({
        message: "Không tìm thấy đơn hàng",
      });
    }

    await Orders.findOneAndUpdate(
      { _id: OrderID, user: userId },
      { $set: { deleted: true } },
      { new: true },
    );

    return res.status(200).json({
      message: "Hủy thành công",
      status: "200",
      
    });
  } catch (err) {
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};


