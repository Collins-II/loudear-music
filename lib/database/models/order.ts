import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrder extends Document {
  buyer: string | mongoose.Types.ObjectId;
  beat: string | mongoose.Types.ObjectId;
  licenseId: string;
  price: number;
  stripeSessionId?: string;
  status: "pending" | "paid" | "failed";
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  buyer: { type: Schema.Types.ObjectId, ref: "User", required: false }, // optional pre-auth
  beat: { type: Schema.Types.ObjectId, ref: "Beat", required: true },
  licenseId: { type: String, required: true },
  price: { type: Number, required: true },
  stripeSessionId: { type: String },
  status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
}, { timestamps: true });

const Order: Model<IOrder> = mongoose.models?.Order || mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
