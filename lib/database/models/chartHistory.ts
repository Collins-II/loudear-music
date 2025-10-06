// lib/database/models/chartHistory.ts
import { Schema, model, models, Document, Types } from "mongoose";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface IChartHistoryItem {
  itemId: Types.ObjectId;
  position: number;
  peak: number;
  weeksOn: number;
}

export interface IChartHistory {
  category: "songs" | "albums" | "artists";
  region: string;
  week: string; // e.g. "2025-W40"
  items: IChartHistoryItem[];
}

// Document type (with _id + timestamps from Mongoose)
export interface IChartHistoryDoc extends IChartHistory, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/* -------------------------------------------------------------------------- */
/*                                   Schema                                   */
/* -------------------------------------------------------------------------- */

const ChartHistorySchema = new Schema<IChartHistoryDoc>(
  {
    category: { type: String, enum: ["songs", "albums", "artists"], required: true },
    region: { type: String, default: "global" },
    week: { type: String, required: true }, // e.g. "2025-W40"
    items: [
      {
        itemId: { type: Schema.Types.ObjectId, required: true },
        position: { type: Number, required: true },
        peak: { type: Number, required: true },
        weeksOn: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

/* -------------------------------------------------------------------------- */
/*                                    Model                                   */
/* -------------------------------------------------------------------------- */

export const ChartHistory =
  models?.ChartHistory || model<IChartHistoryDoc>("ChartHistory", ChartHistorySchema);
