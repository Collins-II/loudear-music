import { Schema, Document, models, model, Types } from "mongoose";

export interface IVideo extends Document {
  author: Types.ObjectId;
  title: string;
  artist: string;
  features?: string[],
  genre?: string;
  releaseDate?: Date;
  description?: string;
  tags?: string[];
  videoUrl?: string;
  thumbnailUrl: string;
  videographer: string;
  createdAt: Date;
  updatedAt: Date;
  duration?: number;

  likes: Types.ObjectId[];
  shares: Types.ObjectId[];
  downloads: Types.ObjectId[];
  views: Types.ObjectId[];
}

const VideoSchema = new Schema<IVideo>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    features: [{ type: String }],
    genre: { type: String, trim: true },
    releaseDate: { type: Date },
    description: { type: String },
    tags: [{ type: String }],
    videoUrl: { type: String },
    thumbnailUrl: { type: String, required: true },
    videographer: { type: String, required: true, trim: true },
    duration: { type: Number},

    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    shares: [{ type: Schema.Types.ObjectId, ref: "User" }],
    downloads: [{ type: Schema.Types.ObjectId, ref: "User" }],
    views: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// ✅ Comments
VideoSchema.virtual("commentCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "targetId",
  count: true,
  match: { targetModel: "Video" },
});

VideoSchema.virtual("latestComments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "targetId",
  match: { targetModel: "Video", parent: null },
  options: { sort: { createdAt: -1 }, limit: 3 },
});

VideoSchema.set("toObject", { virtuals: true });
VideoSchema.set("toJSON", { virtuals: true });

export const Video = models?.Video || model<IVideo>("Video", VideoSchema);
