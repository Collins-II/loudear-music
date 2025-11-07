import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Transaction / Payout record
 * Supports mobile money, PayPal, and Stripe payments
 */
export interface ITransaction extends Document {
  user: Types.ObjectId; // Reference to User
  type: "payout" | "royalty" | "tip" | "purchase";
  amount: number;
  currency: string; // e.g. "ZMW", "USD"
  status: "pending" | "completed" | "failed";
  paymentMethod: "mobile_money" | "paypal" | "stripe" | "manual";
  description?: string;

  // Metadata for mobile money and payout tracking
  mobileMoney?: {
    provider?: "MTN" | "Airtel" | "Zamtel" | "Other";
    phoneNumber?: string;
    transactionId?: string; // from API provider
    verified?: boolean;
  };

  paypal?: {
    transactionId?: string;
    email?: string;
  };

  stripe?: {
    paymentIntentId?: string;
    accountId?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["payout", "royalty", "tip", "purchase"],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "ZMW" },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["mobile_money", "paypal", "stripe", "manual"],
      required: true,
    },
    description: { type: String, maxlength: 500 },

    mobileMoney: {
      provider: { type: String, enum: ["MTN", "Airtel", "Zamtel", "Other"] },
      phoneNumber: { type: String, trim: true },
      transactionId: { type: String, trim: true },
      verified: { type: Boolean, default: false },
    },

    paypal: {
      transactionId: { type: String, trim: true },
      email: { type: String, lowercase: true, trim: true },
    },

    stripe: {
      paymentIntentId: { type: String, trim: true },
      accountId: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

/** 🔍 Indexing for reports */
TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ paymentMethod: 1, status: 1 });

/** 🧠 Static helpers */
TransactionSchema.statics.findUserTransactions = function (userId: Types.ObjectId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

/** ⚙ Prevent recompilation during hot reloads */
export const Transaction: Model<ITransaction> =
  mongoose.models?.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
