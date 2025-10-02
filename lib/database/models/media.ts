import { Schema, model, models, Types } from "mongoose";

// Interface for Featured Media
export interface IMedia {
  title: string;
  description: string;
  type: "music" | "video" | "image";
  mediaId: Types.ObjectId; // reference to uploaded media document
  featured?: boolean;
}

const MediaSchema = new Schema<IMedia>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ["music", "video", "image"], required: true },
    mediaId: { type: Schema.Types.ObjectId, required: true, ref: "UploadedMedia" },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Use existing model if already compiled
const Media = models.Media || model<IMedia>("Media", MediaSchema);

export default Media;
