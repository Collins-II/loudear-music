// lib/models/PromotionPost.ts
import mongoose, { Schema, Model } from "mongoose";

export interface IPromotionPost {
  campaignId: mongoose.Types.ObjectId;
  platform: string;
  contentUrl?: string;
  caption?: string;
  scheduledFor?: Date;
  postedAt?: Date;
  status?: "scheduled" | "posted" | "failed";
  performance?: {
    impressions?: number; likes?: number; shares?: number; comments?: number;
  };
}

const PromotionPostSchema = new Schema<IPromotionPost>({
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
  platform: { type: String, required: true },
  contentUrl: String,
  caption: String,
  scheduledFor: Date,
  postedAt: Date,
  status: { type: String, default: "scheduled" },
  performance: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export const PromotionPost: Model<IPromotionPost> = mongoose.models.PromotionPost || mongoose.model("PromotionPost", PromotionPostSchema);
