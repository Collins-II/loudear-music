import { Schema , models, model} from "mongoose";

// Withdrawal Schema
const WithdrawalSchema = new Schema({
user: { type: Schema.Types.ObjectId, ref: "User", required: true },
amount: Number,
method: String,
status: { type: String, enum: ["pending", "processing", "success", "failed"], default: "pending" },
}, { timestamps: true });


const Withdrawal = models.Withdrawal || model("Withdrawal", WithdrawalSchema);
export default Withdrawal;