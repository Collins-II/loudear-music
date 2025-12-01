import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Transaction / Payment event
 * Supports Mobile Money, Stripe, PayPal (future), internal wallet & payouts
 */
export interface ITransaction extends Document {
  user: Types.ObjectId; // User who initiated or received the transaction
  type:
    | "payout"
    | "royalty"
    | "tip"
    | "purchase"
    | "campaign_payment"
    | "subscription"
    | "wallet_topup";

  product?: {
    id: Types.ObjectId; // song/album/beat/video/campaign/etc
    type: "song" | "album" | "beat" | "video" | "campaign" | "subscription";
  };

  amount: number;
  currency: string;           // "ZMW", "USD", etc.
  status: "pending" | "completed" | "failed";
  paymentMethod: "mobile_money" | "stripe" | "manual";

  description?: string;

  mobileMoney?: {
    provider?: "MTN" | "Airtel" | "Zamtel";
    phoneNumber?: string;
    externalTransactionId?: string; // returned by provider
    internalReference?: string;     // your internal TX ref
    verified?: boolean;
    mode?: "sandbox" | "live";
    rawResponse?: any;              // JSON payload from provider
  };

  stripe?: {
    paymentIntentId?: string;
    accountId?: string;
    rawResponse?: any;
  };

  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    type: {
      type: String,
      enum: [
        "payout",
        "royalty",
        "tip",
        "purchase",
        "campaign_payment",
        "subscription",
        "wallet_topup",
      ],
      required: true,
      index: true,
    },

    product: {
      id: { type: Schema.Types.ObjectId },
      type: {
        type: String,
        enum: ["song", "album", "beat", "video", "campaign", "subscription"],
      },
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
      enum: ["mobile_money", "stripe", "manual"],
      required: true,
    },

    description: { type: String, maxlength: 500 },

    // --------------------------
    // MOBILE MONEY METADATA
    // --------------------------
    mobileMoney: {
      provider: { type: String, enum: ["MTN", "Airtel", "Zamtel"] },
      phoneNumber: { type: String },
      externalTransactionId: { type: String },
      internalReference: { type: String },
      verified: { type: Boolean, default: false },
      mode: { type: String, enum: ["sandbox", "live"], default: "sandbox" },
      rawResponse: { type: Schema.Types.Mixed },
    },

    // -------------------
    // STRIPE METADATA
    // -------------------
    stripe: {
      paymentIntentId: { type: String, trim: true },
      accountId: { type: String, trim: true },
      rawResponse: { type: Schema.Types.Mixed },
    },
  },
  { timestamps: true }
);

/* 📈 Indexing */
TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ paymentMethod: 1, status: 1 });
TransactionSchema.index({ "mobileMoney.provider": 1 });
TransactionSchema.index({ "product.type": 1, "product.id": 1 });

/** 🔍 Helper to fetch all a user's transactions */
TransactionSchema.statics.findUserTransactions = function (userId: Types.ObjectId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

/** ⚙ Prevent recompile on hot reloads */
export const Transaction: Model<ITransaction> =
  mongoose.models?.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
