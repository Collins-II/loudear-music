import { Schema, Document, models, model, Types } from "mongoose";
import { ISong } from "./song";

export interface IAlbum extends Document {
  author: Types.ObjectId;
  title: string;
  artist: string;
  genre?: string;
  releaseDate?: Date;
  description?: string;
  tags?: string[];
  songs: Types.ObjectId[] | ISong[];
  coverUrl?: string;
  duration?: number;

  // ➕ Newly added fields
  producers?: string[];
  collaborators?: string[];
  mood?: string;
  label?: string;
  copyright?: string;
  visibility: "public" | "private" | "unlisted";
  totalSongs?: number;

  // Engagement metrics
  likes: Types.ObjectId[];
  shares: Types.ObjectId[];
  downloads: Types.ObjectId[];
  views: Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

const AlbumSchema = new Schema<IAlbum>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    genre: { type: String, trim: true },
    releaseDate: { type: Date },
    description: { type: String, trim: true },
    tags: [{ type: String, trim: true }],

    // Relationships
    songs: [{ type: Schema.Types.ObjectId, ref: "Song" }],
    coverUrl: { type: String },
    duration: { type: Number },

    // ➕ Added fields
    producers: [{ type: String, trim: true }],
    collaborators: [{ type: String, trim: true }],
    mood: { type: String, trim: true },
    label: { type: String, trim: true },
    copyright: { type: String, trim: true },
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "private",
    },
    totalSongs: { type: Number, default: 0 },

    // Engagement arrays
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    shares: [{ type: Schema.Types.ObjectId, ref: "User" }],
    downloads: [{ type: Schema.Types.ObjectId, ref: "User" }],
    views: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// ✅ Virtuals for comments
AlbumSchema.virtual("commentCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "targetId",
  count: true,
  match: { targetModel: "Album" },
});

AlbumSchema.virtual("latestComments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "targetId",
  match: { targetModel: "Album", parent: null },
  options: { sort: { createdAt: -1 }, limit: 3 },
});

// ✅ Ensure virtuals appear in JSON/object outputs
AlbumSchema.set("toObject", { virtuals: true });
AlbumSchema.set("toJSON", { virtuals: true });

export const Album =
  models?.Album || model<IAlbum>("Album", AlbumSchema);
