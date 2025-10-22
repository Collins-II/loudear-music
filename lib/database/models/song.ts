import { Schema, Document, models, model, Types } from "mongoose";
import "./comment"; // Ensure Comment model is loaded

export interface ISong extends Document {
  author: Types.ObjectId;
  title: string;
  artist: string;
  features?: string[];
  genre?: string;
  description?: string;
  tags?: string[];
  fileUrl: string;
  coverUrl: string;
  duration?: number;
  album?: string;

  explicit?: boolean;
  bpm?: number;
  key?: string;
  mood?: string;
  label?: string;
  visibility: "public" | "private" | "unlisted";

  // Engagement
  likes: Types.ObjectId[];
  shares: Types.ObjectId[];
  downloads: Types.ObjectId[];
  views: Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

const SongSchema = new Schema<ISong>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    features: [{ type: String, trim: true }],
    genre: { type: String, trim: true },
    description: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    fileUrl: { type: String, required: true },
    coverUrl: { type: String, required: true },
    duration: { type: Number },

    // ➕ New fields for better metadata
    album: { type: String },
    explicit: { type: Boolean, default: false },
    bpm: { type: Number },
    key: { type: String, trim: true },
    mood: { type: String, trim: true },
    label: { type: String, trim: true },

    // ➕ Visibility for control (public/private/unlisted)
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "private",
    },

    // Engagement tracking
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    shares: [{ type: Schema.Types.ObjectId, ref: "User" }],
    downloads: [{ type: Schema.Types.ObjectId, ref: "User" }],
    views: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// ✅ Virtuals for comments
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

// Ensure virtuals appear in JSON/object output
SongSchema.set("toObject", { virtuals: true });
SongSchema.set("toJSON", { virtuals: true });

export const Song = models?.Song || model<ISong>("Song", SongSchema);
