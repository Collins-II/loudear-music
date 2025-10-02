// lib/database/models/comment.ts
import { Schema, Document, models, model, Types } from "mongoose";

export type ReactionType = "heart" | "fire" | "laugh" | "up" | "down";

export interface IComment extends Document {
  user: Types.ObjectId; // Comment author
  targetModel: "Song" | "Album" | "Video" | "Post"; // Extendable
  targetId: Types.ObjectId; // ID of the Song, Album, Video, or Post
  parent?: Types.ObjectId; // Parent comment for replies
  content: string;

  likes: Types.ObjectId[]; // Users who liked
  replies: Types.ObjectId[]; // Nested replies
  reactions: Record<ReactionType, number>; // Reaction counts

  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetModel: {
      type: String,
      enum: ["Song", "Album", "Video", "Post"],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true, refPath: "targetModel" },
    parent: { type: Schema.Types.ObjectId, ref: "Comment" },
    content: { type: String, required: true, trim: true },

    // Track likes as user references
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],

    // Nested replies
    replies: [{ type: Schema.Types.ObjectId, ref: "Comment" }],

    // Reactions: heart, fire, laugh, up, down
    reactions: {
      heart: { type: Number, default: 0 },
      fire: { type: Number, default: 0 },
      laugh: { type: Number, default: 0 },
      up: { type: Number, default: 0 },
      down: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// ✅ Virtuals for counts
CommentSchema.virtual("likeCount").get(function (this: IComment) {
  return this.likes?.length || 0;
});
CommentSchema.virtual("replyCount").get(function (this: IComment) {
  return this.replies?.length || 0;
});

// ✅ Populate virtuals in JSON/Objects
CommentSchema.set("toObject", { virtuals: true });
CommentSchema.set("toJSON", { virtuals: true });

export const Comment = models?.Comment || model<IComment>("Comment", CommentSchema);
