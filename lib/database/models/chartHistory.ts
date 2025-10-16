import { Schema, model, models, Document } from "mongoose";

export interface IChartItem {
  itemId: Schema.Types.ObjectId;
  rank: number;
  score: number;
  peak: number;
  weeksOn: number;
}

export interface IChartHistory extends Document {
  category: string;
  region: "Zambia" | "Nigeria" | "Global";
  week: string;
  items: IChartItem[];
}

const ChartHistorySchema = new Schema<IChartHistory>({
  category: { type: String, required: true },
  region: { type: String, enum: ["Zambia", "Nigeria", "Global"], default: "Global" },
  week: { type: String, required: true },
  items: [
    {
      itemId: { type: Schema.Types.ObjectId, required: true },
      rank: Number,
      score: Number,
      peak: Number,
      weeksOn: Number,
    },
  ],
});

export const ChartHistory =
  models?.ChartHistory || model<IChartHistory>("ChartHistory", ChartHistorySchema);
