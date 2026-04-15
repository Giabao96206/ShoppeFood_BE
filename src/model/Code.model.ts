import mongoose, { Schema, model, models } from "mongoose";
interface Code {
  email: string;
  code: string;
  createdAt: Date;
}

const CodeSchema = new Schema<Code>({
  email: { type: String, required: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 900 },
});

const VerificationCode =
  mongoose.models.VerificationCode ||
  mongoose.model("VerificationCode", CodeSchema);

export default VerificationCode;
