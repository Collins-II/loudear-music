import Transaction from "@/lib/database/models/transactions";
import { getCurrentUser } from "../getCurrentUser";
import { connectToDatabase } from "@/lib/database";
import { NextResponse } from "next/server";

// --- Wallet Stats Route ---
export async function GET_STATS() {
await connectToDatabase();
const user = await getCurrentUser();
if (!user?._id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


const income = await Transaction.aggregate([
{ $match: { user: user._id, type: "income" } },
{ $group: { _id: null, total: { $sum: "$amount" } } }
]);


const expenses = await Transaction.aggregate([
{ $match: { user: user._id, type: { $in: ["payout", "fee"] } } },
{ $group: { _id: "$type", total: { $sum: "$amount" } } }
]);


return NextResponse.json({ success: true, income, expenses });
}


// --- Wallet Activity Route ---
export async function GET_ACTIVITY() {
await connectToDatabase();
const user = await getCurrentUser();
if (!user?._id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


const activity = await Transaction.find({ user: user._id })
.sort({ createdAt: -1 })
.limit(50)
.lean();


return NextResponse.json({ success: true, activity });
}


// --- Wallet Limits Route ---
export async function GET_LIMITS() {
await connectToDatabase();
const user = await getCurrentUser();
if (!user?._id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


const limits = {
dailyTopup: 20000,
dailyPayout: 15000,
singleTransactionLimit: 10000,
//kycTier: user.kyc?.tier ?? "basic",
};


return NextResponse.json({ success: true, limits });
}