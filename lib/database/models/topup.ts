// Topup Schema
import mongoose, { Schema } from "mongoose";


const TopupSchema = new Schema({
user: { type: Schema.Types.ObjectId, ref: "User", required: true },
amount: { type: Number, required: true },
currency: { type: String, default: "ZMW" },
provider: String,
phoneNumber: String,
status: { type: String, enum: ["pending", "success", "failed", "processing"], default: "pending" },
transactionId: String,
rawResponse: Schema.Types.Mixed,
}, { timestamps: true });


 const Topup = mongoose.models.Topup || mongoose.model("Topup", TopupSchema);

 export default Topup;