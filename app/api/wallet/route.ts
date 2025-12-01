// app/api/wallet/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { getCurrentUser } from "@/actions/getCurrentUser";
import Transaction from "@/lib/database/models/transactions";
import Payout from "@/lib/database/models/payout";
import Topup from "@/lib/database/models/topup";
import Withdrawal from "@/lib/database/models/withdrawal";
import { Types } from "mongoose";

export async function GET() {
  try {
    await connectToDatabase();
    const user = await getCurrentUser();
    if (!user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = new Types.ObjectId(user._id);

    // Wallet core
    const balance = Number(user.wallet?.balance ?? 0);
    const locked = Number(user.wallet?.locked ?? 0);
    const pendingPayout = Number(user.wallet?.pendingPayout ?? 0);

    // Last 20 transactions
    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Recent topups
    const topups = await Topup.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Recent withdrawals
    const withdrawals = await Withdrawal.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Payout history (mobile money, bank, etc)
    const payouts = await Payout.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Monthly income summary
    const last30DaysIncome = await Transaction.aggregate([
      { $match: { user: userId, type: "income", createdAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Lifetime earnings
    const lifetimeEarnings = await Transaction.aggregate([
      { $match: { user: userId, type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Spending breakdown (payouts, purchases, fees)
    const spending = await Transaction.aggregate([
      { $match: { user: userId, type: { $in: ["payout", "purchase", "fee"] } } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } }
    ]);

    return NextResponse.json({
      success: true,
      user: user,
      wallet: {
        balance,
        locked,
        pendingPayout,
        currency: user.wallet?.currency ?? "ZMW",
      },
      recent: {
        transactions,
        topups,
        withdrawals,
        payouts,
      },
      analytics: {
        last30DaysIncome: last30DaysIncome?.[0]?.total ?? 0,
        lifetimeEarnings: lifetimeEarnings?.[0]?.total ?? 0,
        spending,
      },
    });
  } catch (err: any) {
    console.error("[WALLET_GET_ERROR]", err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
