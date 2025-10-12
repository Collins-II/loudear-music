import { Schema, model, models, Types, Document, Model } from "mongoose";

export interface IViewAnalytics extends Document {
  itemId: Types.ObjectId;
  contentModel: "Song" | "Album" | "Video"; // 👈 renamed from 'model'
  week: string;
  views: number;
}

const ViewAnalyticsSchema = new Schema<IViewAnalytics>(
  {
    itemId: { type: Schema.Types.ObjectId, required: true, refPath: "contentModel" },
    contentModel: {
      type: String,
      enum: ["Song", "Album", "Video"],
      required: true,
    },
    week: { type: String, required: true },
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const ViewAnalytics: Model<IViewAnalytics> =
  models?.ViewAnalytics || model<IViewAnalytics>("ViewAnalytics", ViewAnalyticsSchema);
