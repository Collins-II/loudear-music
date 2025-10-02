import { Schema, Document, model, models, Types } from "mongoose";

export type InteractionType =
  | "play"
  | "download"
  | "like"
  | "share"
  | "view"
  | "comment";

export type InteractionTarget = "Song" | "Album" | "Video" | "Comment";

export interface IInteraction extends Document {
  user: Types.ObjectId;            // who performed the action
  targetModel: InteractionTarget;  // what entity was interacted with
  targetId: Types.ObjectId;        // ID of the entity
  type: InteractionType;           // type of action
  metadata?: Record<string, any>;  // optional details (e.g. device info)
  createdAt: Date;
  updatedAt: Date;
}

const InteractionSchema = new Schema<IInteraction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetModel: {
      type: String,
      enum: ["Song", "Album", "Video", "Comment"],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
    type: {
      type: String,
      enum: ["play", "download", "like", "share", "view", "comment"],
      required: true,
    },
    metadata: { type: Schema.Types.Mixed }, // store flexible JSON details
  },
  { timestamps: true }
);

// Indexes for fast analytics queries
InteractionSchema.index({ user: 1, targetModel: 1, targetId: 1 });
InteractionSchema.index({ targetModel: 1, targetId: 1, type: 1 });
InteractionSchema.index({ type: 1, createdAt: -1 });

export const Interaction =
  models.Interaction || model<IInteraction>("Interaction", InteractionSchema);
