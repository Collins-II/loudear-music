// models/Beat.ts

import { Schema, Document, models, model, Types } from "mongoose";
import "./comment"; // Ensure comment virtuals work

export interface ILicenseTier {
  id: string;                // "basic", "pro", "exclusive"
  title: string;             // "Basic License"
  price: number;             // ZMW or your currency
  description?: string;
  usageRights: string[];
  fileUrl?: string;          // downloadable asset for this tier
}

export interface IBeat extends Document {
  author: Types.ObjectId;            // Producer (User)
  title: string;
  producerName?: string;             // Optional display fallback
  genre?: string;
  description?: string;
  tags?: string[];

  bpm?: number;
  key?: string;

  image?: string;                    // beat cover
  fileUrl: string;                   // full beat file
  previewUrl?: string;               // short preview

  licenseTiers: ILicenseTier[];

  visibility: "public" | "private" | "unlisted";

  // Engagement
  likes: Types.ObjectId[];
  shares: Types.ObjectId[];
  downloads: Types.ObjectId[];
  views: Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  commentCount?: number;
  latestComments?: unknown[];
}

const LicenseTierSchema = new Schema<ILicenseTier>(
  {
    id: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    description: { type: String, trim: true },
    fileUrl: { type: String, trim: true },
    usageRights: [{ type: String, trim: true }],
  },
  { _id: false }
);

const BeatSchema = new Schema<IBeat>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true, trim: true },
    producerName: { type: String, trim: true },

    genre: { type: String, trim: true },
    description: { type: String, trim: true },
    tags: [{ type: String, trim: true }],

    bpm: { type: Number },
    key: { type: String, trim: true },

    image: { type: String, trim: true },
    fileUrl: { type: String, required: true },
    previewUrl: { type: String, trim: true },

    licenseTiers: {
      type: [LicenseTierSchema],
      default: [],
    },

    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "private",
    },

    // Engagement
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    shares: [{ type: Schema.Types.ObjectId, ref: "User" }],
    downloads: [{ type: Schema.Types.ObjectId, ref: "User" }],
    views: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/* VIRTUALS (comments) */
/* ------------------------------------------------------------------ */

BeatSchema.virtual("commentCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "targetId",
  count: true,
  match: { targetModel: "Beat" },
});

BeatSchema.virtual("latestComments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "targetId",
  justOne: false,
  match: { targetModel: "Beat", parent: null },
  options: { sort: { createdAt: -1 }, limit: 5 },
});

// Output virtuals
BeatSchema.set("toObject", { virtuals: true });
BeatSchema.set("toJSON", { virtuals: true });

export const Beat = models?.Beat || model<IBeat>("Beat", BeatSchema);
export default Beat;
