import mongoose, { Schema, Model, Types } from "mongoose";

export interface ILocation {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface IOrderItem {
  itemId?: Types.ObjectId;
  image?: string;
  name: string;
  option?: string;
  price: number;
  quantity?: number;
}

export interface IOrders {
  restaurantId: Types.ObjectId;
  userId: Types.ObjectId;
  driverId?: Types.ObjectId | null;

  pickupLocation: ILocation;
  dropoffLocation: ILocation;

  cityId: string;

  status: OrderStatus;

  totalPrice: number;
  deliveryFee: number;
  quantity: number;

  details: IOrderItem[];

  orderTime?: Date;
  deleted?: boolean;
}

export type OrderStatus =
  | "Ordered"
  | "Driver_Assigned"
  | "Picked_Up"
  | "Delivered"
  | "Cancelled";

const locationSchema = new Schema<ILocation>(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrders>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "restaurants",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },

    driverId: {
      type: Schema.Types.ObjectId,
      ref: "drivers",
      default: null,
      index: true,
    },

    pickupLocation: {
      type: locationSchema,
      required: true,
    },

    dropoffLocation: {
      type: locationSchema,
      required: true,
    },

    cityId: {
      type: String,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "Ordered",
        "Driver_Assigned",
        "Picked_Up",
        "Delivered",
        "Cancelled",
      ],
      default: "Ordered",
      index: true,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    details: [
      {
        itemId: {
          type: Schema.Types.ObjectId,
          ref: "menu_items",
        },
        image: String,
        name: {
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
          default: 1,
        },
      },
    ],

    orderTime: {
      type: Date,
      default: Date.now,
    },

    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ pickupLocation: "2dsphere" });
orderSchema.index({ dropoffLocation: "2dsphere" });


const Orders: Model<IOrders> =
  (mongoose.models.Orders as Model<IOrders>) ||
  mongoose.model<IOrders>("Orders", orderSchema);

export default Orders;