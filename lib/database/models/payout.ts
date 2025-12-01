import { Schema, models, model } from "mongoose";




// Payout Schema
const PayoutSchema = new Schema({
user: { type: Schema.Types.ObjectId, ref: "User", required: true },
provider: String,
amount: Number,
currency: { type: String, default: "ZMW" },
phoneNumber: String,
externalReference: String,
status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
rawResponse: Schema.Types.Mixed,
}, { timestamps: true });


const Payout = models.Payout || model("Payout", PayoutSchema);
export default Payout;