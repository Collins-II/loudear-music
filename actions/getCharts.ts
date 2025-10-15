"use server";

import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

import { connectToDatabase } from "@/lib/database";
import { ChartHistory, IChartHistory } from "@/lib/database/models/chartHistory";
import { Song } from "@/lib/database/models/song";
import { Album } from "@/lib/database/models/album";
import { Video } from "@/lib/database/models/video";
import { normalizeDoc } from "@/lib/utils";
import { ViewAnalytics } from "@/lib/database/models/viewsAnalytics";

export type ItemType = "Song" | "Album" | "Video";
export type ChartCategory = "songs" | "albums" | "videos";

export interface ChartItem {
  id: string;
  title: string;
  artist?: string;
  image: string;
  videoUrl?: string;
  position: number;
  lastWeek?: number | null;
  peak?: number | null;
  weeksOn: number;
  region: string;
  genre: string;
  releaseDate: string;
  stats: {
    plays: number;
    downloads: number;
    likes: number;
    views: number;
    shares: number;
    comments: number;
  };
  snippet?: { start: number; end: number };
}

/* ------------------------------------------------------------------ */
/* Trending Calculation */
/* ------------------------------------------------------------------ */
/**
 * Calculates trending items with consistent analytics (views, likes, shares, etc.)
 */
export async function getTrending({
  model,
  limit = 50,
  sinceDays = 7,
}: {
  model: ItemType;
  limit?: number;
  sinceDays?: number;
}) {
  await connectToDatabase();

  const Model = model === "Song" ? Song : model === "Album" ? Album : Video;

  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - sinceDays);

  let rawItems = await Model.find({ createdAt: { $gte: sinceDate } })
    .lean()
    .exec();

  // Fallback
  if (!Array.isArray(rawItems) || rawItems.length < 5) {
    console.warn(
      `[getTrending] Only ${rawItems?.length ?? 0} recent ${model}s found, falling back to all records`
    );
    rawItems = await Model.find().lean().exec();
  }

  const itemIds = rawItems.map((i) => i._id);

  // ✅ Aggregate total views from analytics
  const viewsData = await ViewAnalytics.aggregate([
    { $match: { itemId: { $in: itemIds }, model } },
    { $group: { _id: "$itemId", totalViews: { $sum: "$views" } } },
  ]);

  const viewMap = new Map(
    viewsData.map((v) => [String(v._id), v.totalViews])
  );

  // ✅ Compute scores
  const scored = rawItems.map((it: any) => {
    const n = normalizeDoc(it);
    const totalViews = viewMap.get(String(n._id)) ?? 0;

    const score =
      totalViews + // now using real view analytics
      (n.likeCount || 0) * 2 +
      (n.shareCount || 0) * 3 +
      (n.downloadCount || 0) * 1.5;

    return { ...n, viewCount: totalViews, trendingScore: score };
  });

  scored.sort((a, b) => b.trendingScore - a.trendingScore);
  return scored.slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* Charts Builder with View Analytics */
/* ------------------------------------------------------------------ */
export async function getCharts({
  category,
  region = "global",
  sort = "all-time",
  limit = 50,
}: {
  category: ChartCategory;
  region?: string;
  sort?: "this-week" | "last-week" | "all-time";
  limit?: number;
}): Promise<ChartItem[]> {
  await connectToDatabase();

  const model: ItemType =
    category === "songs" ? "Song" : category === "albums" ? "Album" : "Video";

  const trending = await getTrending({ model, limit: 200, sinceDays: 365 });
  if (!trending.length) return [];

  const thisWeek = `${dayjs().year()}-W${String(dayjs().isoWeek()).padStart(2, "0")}`;
  const lastWeek = `${dayjs().subtract(1, "week").year()}-W${String(
    dayjs().subtract(1, "week").isoWeek()
  ).padStart(2, "0")}`;

  // Fetch chart history
  const [currentSnapshot, prevSnapshot] = (await Promise.all([
    ChartHistory.findOne({ category, week: thisWeek }).lean().exec(),
    ChartHistory.findOne({ category, week: lastWeek }).lean().exec(),
  ])) as (IChartHistory | null)[];

  const currentItems =
    currentSnapshot?.items ??
    trending.map((t, idx) => ({
      itemId: t._id,
      position: idx + 1,
      peak: idx + 1,
      weeksOn: 1,
    }));

  const currentMap = new Map(currentItems.map((i) => [String(i.itemId), i]));
  const lastMap = new Map((prevSnapshot?.items ?? []).map((i) => [String(i.itemId), i]));

  // Fetch all view analytics for this week in batch
  const ids = trending.map((t) => t._id);
  const analytics = await ViewAnalytics.find({
    itemId: { $in: ids },
    model,
    week: thisWeek,
  }).lean();

  const analyticsMap = new Map(analytics.map((a) => [String(a.itemId), a.views ?? 0]));

  const items: ChartItem[] = trending.slice(0, limit).map((t, idx) => {
    const idStr = String(t._id);
    const cur = currentMap.get(idStr);
    const last = lastMap.get(idStr);

    const views = analyticsMap.get(idStr) ?? t.viewCount ?? 0;

    return {
      id: idStr,
      title: t.title,
      artist: t.artist ?? "Unknown Artist",
      image: t.coverUrl ?? "",
      videoUrl: t.videoUrl,
      position: cur?.peak ?? idx + 1,
      lastWeek: last?.peak ?? null,
      peak: cur?.peak ?? idx + 1,
      weeksOn: cur?.weeksOn ?? 1,
      region,
      genre: t.genre ?? "Unknown",
      releaseDate: t.releaseDate ?? new Date().toISOString(),
      stats: {
        plays: t.viewCount ?? 0,
        downloads: t.downloadCount ?? 0,
        likes: t.likeCount ?? 0,
        views, // ✅ synced with ViewAnalytics model
        shares: t.shareCount ?? 0,
        comments: t.commentCount ?? 0,
      },
    };
  });

  // Sorting options
  if (sort === "this-week") {
    items.sort((a, b) => a.position - b.position);
  } else if (sort === "last-week") {
    items.sort((a, b) => (a.lastWeek ?? 999) - (b.lastWeek ?? 999));
  } else if (sort === "all-time") {
    items.sort((a, b) => (b.stats.plays ?? 0) - (a.stats.plays ?? 0));
  }

  // Emit real-time updates
  if (Array.isArray(items) && items.length > 1) {
    globalThis.io?.emit("charts:update:category", { category, items });
    items.forEach((item) => {
      globalThis.io?.emit("charts:update:item", {
        id: item.id,
        newPos: item.position,
      });
    });
  }

  return items;
}
