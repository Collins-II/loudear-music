import mongoose, { Schema, Document, model, models } from "mongoose";

export type PaymentChannel = "mobile_money" | "card" | "bank" | "crypto";
export type MobileNetwork = "mtn" | "airtel" | "vodafone" | "zamtel";
export type PaymentStatus = "pending" | "success" | "failed" | "refunded" | "cancelled";

export interface IPayment extends Document {
  sender: mongoose.Types.ObjectId; // Who made the payment
  receiver: mongoose.Types.ObjectId; // Who receives the payment (creator, platform, etc.)
  amount: number;
  currency: string; // e.g. ZMW, UGX, GHS, KES, USD
  channel: PaymentChannel;
  network?: MobileNetwork; // only for mobile money
  phoneNumber?: string;
  country: string; // country code, e.g. "ZM"
  reference: string; // transaction ID (from gateway)
  providerTxnId?: string; // from MTN/Airtel API
  description?: string;

  status: PaymentStatus;
  verificationStatus?: "pending" | "verified" | "unverified";
  webhookReceived?: boolean;

  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true },
    channel: {
      type: String,
      enum: ["mobile_money", "card", "bank", "crypto"],
      required: true,
      default: "mobile_money",
    },
    network: {
      type: String,
      enum: ["mtn", "airtel", "vodafone", "zamtel"],
      required: function (this: IPayment) {
        return this.channel === "mobile_money";
      },
    },
    phoneNumber: {
      type: String,
      required: function (this: IPayment) {
        return this.channel === "mobile_money";
      },
    },
    country: { type: String, required: true, uppercase: true },
    reference: { type: String, required: true, unique: true },
    providerTxnId: { type: String },
    description: { type: String, default: "Content monetization payment" },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded", "cancelled"],
      default: "pending",
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "unverified"],
      default: "pending",
    },
    webhookReceived: { type: Boolean, default: false },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

// 🔹 Auto-generate unique reference if not set
PaymentSchema.pre("validate", function (next) {
  if (!this.reference) {
    this.reference = `PMT-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
  next();
});

// 🔹 Index for performance and fraud checks
PaymentSchema.index({ sender: 1, receiver: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ reference: 1 }, { unique: true });

export const Payment = models?.Payment || model<IPayment>("Payment", PaymentSchema);
