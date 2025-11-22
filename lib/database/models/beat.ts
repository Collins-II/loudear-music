// models/Beat.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export type LicenseTier = {
  id: string;           // e.g. "basic", "pro", "exclusive"
  title: string;        // "Basic License"
  price: number;        // price in smallest currency unit (cents) or use floats in ZMW
  description?: string;
  usageRights: string[]; // human readable bullet points
};

export interface IBeat extends Document {
  _id: string;
  title: string;
  producer: mongoose.Types.ObjectId | string;
  image?: string;
  audioUrl: string;        // hosted audio (preview or full)
  audioSnippet: string;
  bpm?: number;
  key?: string;
  genre?: string;
  price?: number;             // default price (optional)
  licenseTiers?: LicenseTier[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  stats?: {
    plays: number;
    purchases: number;
    downloads: number;
  };
}

const LicenseTierSchema = new Schema<LicenseTier>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true }, // in cents or ZMW unit depending on your app
  description: { type: String },
  usageRights: [{ type: String }],
});

const BeatSchema = new Schema<IBeat>({
  title: { type: String, required: true, trim: true },
  producer: { type: Schema.Types.ObjectId, ref: "User", required: true },
  image: { type: String },
  audioUrl: { type: String, required: true },
  audioSnippet: { type: String, required: true },
  bpm: { type: Number },
  key: { type: String },
  genre: { type: String },
  price: { type: Number },
  licenseTiers: { type: [LicenseTierSchema], default: [] },
  published: { type: Boolean, default: false },
  stats: {
    plays: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
  },
}, { timestamps: true });

const Beat: Model<IBeat> = mongoose.models?.Beat || mongoose.model<IBeat>("Beat", BeatSchema);
export default Beat;
