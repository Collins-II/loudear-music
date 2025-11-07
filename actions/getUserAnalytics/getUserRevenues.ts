// lib/actions/getUserAnalytics.ts
import { connectToDatabase } from "@/lib/database";
import { Payment } from "@/lib/database/models/payment";
import mongoose from "mongoose";

export interface UserAnalytics {
  revenue: number;
  customers: number;
  activeAccounts: number;
  growthRate: number;
  trends: {
    revenue: number;
    customers: number;
    activeAccounts: number;
    growthRate: number;
  };
}

/**
 * Fetch and compute revenue analytics for a specific user.
 * @param userId - The receiver user's ID (ObjectId string)
 */
export async function getUserRevenues(userId: string): Promise<UserAnalytics> {
  await connectToDatabase();

  const uid = new mongoose.Types.ObjectId(userId);
  const now = new Date();

  // Define date ranges
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Aggregate data for current and previous month
  const [currentData, previousData] = await Promise.all([
    Payment.aggregate([
      { $match: { receiver: uid, status: "success", createdAt: { $gte: thisMonthStart } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$amount" },
          customers: { $addToSet: "$sender" },
        },
      },
    ]),
    Payment.aggregate([
      {
        $match: {
          receiver: uid,
          status: "success",
          createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$amount" },
          customers: { $addToSet: "$sender" },
        },
      },
    ]),
  ]);

  // Compute monthly totals
  const curr = currentData[0] || { revenue: 0, customers: [] };
  const prev = previousData[0] || { revenue: 0, customers: [] };

  // Revenue growth rate (%)
  const revenueGrowth =
    prev.revenue === 0 ? 100 : ((curr.revenue - prev.revenue) / prev.revenue) * 100;

  // Customer growth (%)
  const customerGrowth =
    prev.customers.length === 0
      ? 100
      : ((curr.customers.length - prev.customers.length) / prev.customers.length) * 100;

  // Active accounts — senders with payments in last 30 days
  const activeSince = new Date();
  activeSince.setDate(now.getDate() - 30);

  const activeAccountsCount = await Payment.aggregate([
    {
      $match: {
        receiver: uid,
        status: "success",
        createdAt: { $gte: activeSince },
      },
    },
    { $group: { _id: "$sender" } },
    { $count: "count" },
  ]);

  const activeAccounts = activeAccountsCount[0]?.count || 0;

  // Estimate growth rate trend — comparing active accounts month-over-month
  const activeAccountsPrev = await Payment.aggregate([
    {
      $match: {
        receiver: uid,
        status: "success",
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
      },
    },
    { $group: { _id: "$sender" } },
    { $count: "count" },
  ]);

  const prevActive = activeAccountsPrev[0]?.count || 0;
  const activeGrowth =
    prevActive === 0 ? 100 : ((activeAccounts - prevActive) / prevActive) * 100;

  const growthRate = (revenueGrowth + customerGrowth + activeGrowth) / 3;

  return {
    revenue: curr.revenue || 0,
    customers: curr.customers.length || 0,
    activeAccounts,
    growthRate,
    trends: {
      revenue: Number(revenueGrowth.toFixed(2)),
      customers: Number(customerGrowth.toFixed(2)),
      activeAccounts: Number(activeGrowth.toFixed(2)),
      growthRate: Number(growthRate.toFixed(2)),
    },
  };
}
