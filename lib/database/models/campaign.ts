// lib/models/Campaign.ts
import mongoose, { Schema, Model } from "mongoose";

export interface ICampaignTargeting {
  countries?: string[];
  cities?: string[];
  ageRange?: { min?: number; max?: number };
  genres?: string[];
  platforms?: string[]; // tiktok, instagram, youtube, app, email, sms
  devices?: string[]; // ios, android, desktop
  engagementScoreMin?: number;
}

export interface ICampaignPerf {
  impressions: number;
  clicks: number;
  conversions: number;
  streams: number;
  cost: number;
}

export interface ICampaign {
  artistId: mongoose.Types.ObjectId;
  mediaType: "song" | "album" | "video";
  mediaId: mongoose.Types.ObjectId | string;
  campaignName: string;
  budget: number;
  dailyCap?: number | null;
  status: "draft" | "running" | "paused" | "completed" | "stopped";
  targeting: ICampaignTargeting;
  performance: ICampaignPerf;
  ai?: {
    caption?: string;
    adCopy?: string;
    hashtags?: string[];
  };
  schedule?: {
    startDate?: Date;
    endDate?: Date;
    timezone?: string;
    autoBoost?: boolean;
    autoStop?: boolean;
  };
  billing?: {
    walletId?: mongoose.Types.ObjectId;
    lastCharge?: Date;
    nextCharge?: Date;
  };
}

const CampaignSchema = new Schema<ICampaign>({
  artistId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  mediaType: { type: String, enum: ["song", "album", "video"], required: true },
  mediaId: { type: Schema.Types.ObjectId, required: true },
  campaignName: { type: String, required: true },
  budget: { type: Number, required: true },
  dailyCap: { type: Number },
  status: { type: String, default: "draft" },
  targeting: { type: Schema.Types.Mixed, default: {} },
  performance: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    streams: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
  },
  ai: { type: Schema.Types.Mixed },
  schedule: { type: Schema.Types.Mixed },
  billing: { type: Schema.Types.Mixed },
}, { timestamps: true });

export const Campaign: Model<ICampaign> = mongoose.models.Campaign || mongoose.model("Campaign", CampaignSchema);
