import { Schema, model, models, Types, Document } from "mongoose";

/**
 * Supported media types inside LoudEar.
 */
export type MediaType =
  | "song"
  | "beat"
  | "album"
  | "video"
  | "podcast"
  | "playlist"
  | "stem"
  | "mix"
  | "other";

/**
 * Royalty Split Interface
 */
export interface IRoyaltySplit extends Document {
  mediaId: Types.ObjectId;               // Universal media reference
  mediaType: MediaType;                  // song, beat, album, video, etc.

  /** DEPRECATED — kept for backward compatibility */
  songId?: Types.ObjectId;

  ownerId: Types.ObjectId;               // Original uploader / copyright owner
  collaboratorName: string;
  collaboratorEmail?: string;
  collaboratorUserId?: Types.ObjectId | null;

  role?: string;                         // producer, artist, mixer, engineer, etc.
  percent: number;                       // % split
  destination?: string;                  // mobile money number / Stripe acct / bank

  verified: boolean;                     // owner must verify the split
  inviteToken?: string;                  // for inviting collaborators before signup

  createdAt: Date;
  updatedAt: Date;
}

const RoyaltySplitSchema = new Schema<IRoyaltySplit>(
  {
    // New unified media reference
    mediaId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    mediaType: {
      type: String,
      required: true,
      enum: [
        "song",
        "beat",
        "album",
        "video",
        "podcast",
        "project",
        "stem",
        "mix",
        "other",
      ],
      index: true,
    },

    // Deprecated: for legacy compatibility
    songId: {
      type: Schema.Types.ObjectId,
      ref: "Song",
      required: false,
      index: true,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    collaboratorName: { type: String, required: true, trim: true },
    collaboratorEmail: { type: String, trim: true, lowercase: true, index: true },
    collaboratorUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },

    role: { type: String, trim: true },

    percent: { type: Number, required: true, min: 0, max: 100 },

    destination: { type: String, trim: true },

    verified: { type: Boolean, default: false },

    inviteToken: { type: String, trim: true, sparse: true },
  },
  { timestamps: true }
);

/**
 * Indexes for performance and duplicate prevention
 */
RoyaltySplitSchema.index({ mediaId: 1, collaboratorUserId: 1 });
RoyaltySplitSchema.index({ mediaId: 1, collaboratorEmail: 1 });
RoyaltySplitSchema.index({ mediaId: 1, percent: 1 });
RoyaltySplitSchema.index({ mediaType: 1, mediaId: 1 });
RoyaltySplitSchema.index({ ownerId: 1 });

/** Legacy backward compatibility */
RoyaltySplitSchema.index({ songId: 1, ownerId: 1 });

export const RoyaltySplit =
  models?.RoyaltySplit || model<IRoyaltySplit>("RoyaltySplit", RoyaltySplitSchema);

export default RoyaltySplit;
