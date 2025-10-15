import { Schema, Document, models, model, Types } from "mongoose";
import "./comment"; // Ensure Comment model is loaded

export interface ISong extends Document {
  author: Types.ObjectId;
  title: string;
  artist: string;
  features?: string[];
  genre: string;
  description: string;
  tags?: string[];
  fileUrl: string;
  coverUrl: string;
  createdAt: Date;
  updatedAt: Date;
  duration?: number;

  likes: Types.ObjectId[];
  shares: Types.ObjectId[];
  downloads: Types.ObjectId[];
  views: Types.ObjectId[];
}

const SongSchema = new Schema<ISong>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    features: [{ type: String }],
    genre:  { type: String, trim: true },
    description:  { type: String, trim: true },
    tags: [{ type: String }],
    fileUrl: { type: String, required: true },
    coverUrl: { type: String, required: true },
    duration: { type: Number },

    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    shares: [{ type: Schema.Types.ObjectId, ref: "User" }],
    downloads: [{ type: Schema.Types.ObjectId, ref: "User" }],
    views: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// ✅ Comments
SongSchema.virtual("commentCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "targetId",
  count: true,
  match: { targetModel: "Song" },
});

SongSchema.virtual("latestComments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "targetId",
  justOne: false,
  match: { targetModel: "Song", parent: null },
  options: { sort: { createdAt: -1 }, limit: 5 },
});

SongSchema.set("toObject", { virtuals: true });
SongSchema.set("toJSON", { virtuals: true });

export const Song = models?.Song || model<ISong>("Song", SongSchema);
