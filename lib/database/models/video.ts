import { Schema, Document, models, model, Types } from "mongoose";

export interface IVideo extends Document {
  author: Types.ObjectId;
  title: string;
  artist: string;
  features?: string[];
  genre?: string;
  releaseDate?: Date;
  description?: string;
  tags?: string[];
  videoUrl: string;
  thumbnailUrl: string;
  videographer?: string;
  duration?: number;

  // ➕ Extended metadata fields
  label?: string;
  copyright?: string;
  mood?: string;
  visibility: "public" | "private" | "unlisted";

  // Engagement tracking
  likes: Types.ObjectId[];
  shares: Types.ObjectId[];
  downloads: Types.ObjectId[];
  views: Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    features: [{ type: String, trim: true }],
    genre: { type: String, trim: true },
    releaseDate: { type: Date },
    description: { type: String, trim: true },
    tags: [{ type: String, trim: true }],

    // URLs for video & thumbnail
    videoUrl: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, required: true, trim: true },

    // Video details
    videographer: { type: String, trim: true },
    duration: { type: Number },

    // ➕ Extended metadata
    label: { type: String, trim: true },
    copyright: { type: String, trim: true },
    mood: { type: String, trim: true },

    // ➕ Visibility support
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

// ✅ Comments Virtuals
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

// Include virtuals in output
VideoSchema.set("toObject", { virtuals: true });
VideoSchema.set("toJSON", { virtuals: true });

export const Video = models?.Video || model<IVideo>("Video", VideoSchema);
