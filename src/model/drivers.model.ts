import mongoose, { Schema, model, models, Model } from "mongoose";

interface IDriver {
  fullName: string;
  phone: string;
  vehicleInfo: {
    plateNumber: string;
    type: "Motorbike" | "Car" | "Truck";
  };
  cityId: string;
  currentStatus: "Offline" | "Available" | "Busy";
  rating: number;
  totalCompletedOrders: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const driverSchema = new Schema<IDriver>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    vehicleInfo: {
      plateNumber: {
        type: String,
        required: true,
      },

      type: {
        type: String,
        enum: ["Motorbike", "Car", "Truck"],
        default: "Motorbike",
      },
    },
    cityId: {
      type: String,
      required: true,
    },
    currentStatus: {
      type: String,
      enum: ["Offline", "Available", "Busy"],
      default: "Offline",
    },
    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    totalCompletedOrders: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Driver =
  (models.Driver as Model<IDriver>) ||
  model<IDriver>("Driver", driverSchema);

export default Driver;