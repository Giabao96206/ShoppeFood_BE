import mongoose, { Schema, model, models, Model, Types } from "mongoose";

interface IDriverLocation {
  driverId: Types.ObjectId;
  cityId: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  status: "Offline" | "Available" | "Busy";
  updatedAt?: Date;
  createdAt?: Date;
}

const driverLocationSchema = new Schema<IDriverLocation>(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
      unique: true, // mỗi tài xế chỉ có 1 vị trí hiện tại
    },

    cityId: {
      type: String,
      required: true,
      index: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },

      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (value: number[]) {
            return value.length === 2;
          },
          message: "Coordinates must contain [longitude, latitude]",
        },
      },
    },

    status: {
      type: String,
      enum: ["Offline", "Available", "Busy"],
      default: "Offline",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

driverLocationSchema.index({ location: "2dsphere" });

driverLocationSchema.index(
  { updatedAt: 1 },
  {
    expireAfterSeconds: 120,
  }
);

const DriverLocation =
  (models.DriverLocation as Model<IDriverLocation>) ||
  model<IDriverLocation>("DriverLocation", driverLocationSchema);

export default DriverLocation;