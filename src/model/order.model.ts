import mongoose, { Schema, model, models, Model, Types } from "mongoose";
interface IOrders {
  restaurant: Types.ObjectId;
  user: Types.ObjectId;
  status?: string;
  totalPrice: number;
  quantity: number;
  orderTime?: Date;
  details: IDetails[];
  deleted?: boolean;
}

interface IDetails {
  image: string;
  option?: string;
  price: number;
  quantity: number;
  title: string;
}
const orderSchema = new Schema<IOrders>(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "restaurants",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    status: {
      type: String,
      default: "Ordered",
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    orderTime: {
      type: Date,
      default: Date.now,
    },
    details: [
      {
        image: {
          type: String,
          required: true,
        },
        option: {
          type: String,
          default: "",
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true },
);

const Orders =
  (mongoose.models.Orders as Model<IOrders>) ||
  mongoose.model("Orders", orderSchema);

export default Orders;
