import { model, models, Schema } from "mongoose";

const AudienceProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    genres: [String],
    behaviors: {
      likes: Number,
      skips: Number,
      repeats: Number,
      shares: Number,
    },
    engagementScore: Number,
    predictedInterestGenres: [String],
  },
  { timestamps: true }
);

export default models.Audience ||
  model("Audience", AudienceProfileSchema);
