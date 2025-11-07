// lib/actions/getUserFollowersAnalytics.ts

import { connectToDatabase } from "@/lib/database";
import User from "@/lib/database/models/user";
import mongoose from "mongoose";

export interface FollowerAnalytics {
  totalFollowers: number;
  newFollowers: number;
  growthRate: number;
  followerTrend: { date: string; count: number }[];
}

/**
 * Returns detailed analytics for a user's followers (stan-based).
 * Uses the `stan` array on the User model as the source of truth.
 */
export async function getUserFollowersAnalytics(userId: string): Promise<FollowerAnalytics> {
  await connectToDatabase();

  const uid = new mongoose.Types.ObjectId(userId);

  // 🧠 Fetch the user document (with stan field populated length)
  const user = await User.findById(uid).select("stan createdAt updatedAt").lean();

  if (!user) {
    throw new Error("User not found");
  }

  const totalFollowers = user.stan?.length || 0;

  // For trend analysis, we’ll assume we can inspect when followers joined:
  // If you later extend stan to hold { followerId, followedAt }, this will become time-accurate.
  // For now, we’ll simulate trend using user timestamps and follower counts.

  //const now = new Date();
  //const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  //const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // 🗓 Compute followers gained this month (approximate)
  // You could replace this with actual logs or events for precision
  const newFollowers = Math.floor(totalFollowers * 0.1); // ~10% estimated growth placeholder

  // 📈 Simulated previous month data (could be replaced with real monthly snapshot collection)
  const lastMonthFollowers = Math.max(totalFollowers - newFollowers, 0);

  const growthRate =
    lastMonthFollowers === 0
      ? 100
      : ((totalFollowers - lastMonthFollowers) / lastMonthFollowers) * 100;

  // 📊 Mock trend array (for dashboard charts)
  const followerTrend = Array.from({ length: 6 }).map((_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const count = Math.floor(
      lastMonthFollowers + ((totalFollowers - lastMonthFollowers) / 6) * i
    );
    return { date: date.toISOString().slice(0, 10), count };
  });

  return {
    totalFollowers,
    newFollowers,
    growthRate: Number(growthRate.toFixed(2)),
    followerTrend,
  };
}
