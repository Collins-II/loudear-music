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
  songs: ISong[];
  coverUrl: string;
  createdAt: Date;
  updatedAt: Date;
  duration?: number;

  likes: Types.ObjectId[];
  shares: Types.ObjectId[];
  downloads: Types.ObjectId[];
  views: Types.ObjectId[];
}

const AlbumSchema = new Schema<IAlbum>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    genre: { type: String, trim: true },
    releaseDate: { type: Date },
    description: { type: String },
    tags: [{ type: String }],
    songs: [{ type: Schema.Types.ObjectId, ref: "Song" }],
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

AlbumSchema.set("toObject", { virtuals: true });
AlbumSchema.set("toJSON", { virtuals: true });

export const Album = models?.Album || model<IAlbum>("Album", AlbumSchema);
