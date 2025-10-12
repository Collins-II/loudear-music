import { Types } from "mongoose";
import { ViewAnalytics } from "./database/models/viewsAnalytics";

/**
 * Fetch total and previous week view counts for an item
 */
export async function getViewCounts(itemId: Types.ObjectId, model: "Song" | "Album" | "Video") {
  const analytics = await ViewAnalytics.find({ itemId, model }).lean();

  const totalViews = analytics.reduce((sum, entry) => sum + (entry.views || 0), 0);

  // Sort by week to find last week's stats
  const sorted = analytics.sort((a, b) => (a.week < b.week ? 1 : -1));
  const previousViewCount = sorted[1]?.views ?? 0;

  return { totalViews, previousViewCount };
}

/**
 * Get ISO week string (e.g., "2025-W41")
 */
export function getWeekIdentifier(date = new Date()): string {
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil(((date.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${week}`;
}

/**
 * Get previous week identifier (e.g., from W41 → W40)
 */
export function getPreviousWeek(): string {
  const now = new Date();
  now.setDate(now.getDate() - 7);
  return getWeekIdentifier(now);
}

/**
 * Increment or fetch view analytics for a given item and model.
 */
export async function getOrCreateViewAnalytics(
  itemId: Types.ObjectId | string,
  model: "Song" | "Album" | "Video",
  incrementView = false
) {
  const week = getWeekIdentifier();
  const normalizedItemId =
    typeof itemId === "string" ? new Types.ObjectId(itemId) : itemId;

  let doc = await ViewAnalytics.findOne({ itemId: normalizedItemId, model, week });

  if (!doc) {
    doc = await ViewAnalytics.create({
      itemId: normalizedItemId,
      model,
      week,
      views: 0,
    });
  }

  if (incrementView) {
    doc.views += 1;
    await doc.save();
  }

  return doc;
}

/**
 * Atomically increments view count (no race conditions)
 */
export async function incrementViewCount(
  itemId: Types.ObjectId | string,
  model: "Song" | "Album" | "Video"
) {
  const week = getWeekIdentifier();

  await ViewAnalytics.updateOne(
    { itemId, model, week },
    { $inc: { views: 1 } },
    { upsert: true }
  );
}

/**
 * Compare current week vs previous week view performance.
 * Returns { currentWeek, previousWeek, growth, growthRate }
 */
export async function getWeeklyGrowthStats(
  itemId: Types.ObjectId | string,
  model: "Song" | "Album" | "Video"
) {
  const thisWeek = getWeekIdentifier();
  const prevWeek = getPreviousWeek();

  const [current, previous] = await Promise.all([
    ViewAnalytics.findOne({ itemId, model, week: thisWeek }).lean(),
    ViewAnalytics.findOne({ itemId, model, week: prevWeek }).lean(),
  ]);

  const currentViews = current?.views ?? 0;
  const prevViews = previous?.views ?? 0;

  const growth = currentViews - prevViews;
  const growthRate = prevViews > 0 ? (growth / prevViews) * 100 : currentViews > 0 ? 100 : 0;

  return {
    currentWeek: currentViews,
    previousWeek: prevViews,
    growth,
    growthRate: Math.round(growthRate * 10) / 10, // round to 1 decimal
  };
}
