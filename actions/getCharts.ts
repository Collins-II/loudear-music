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
import { getViewCounts } from "@/lib/get-views-analytics";
import { Types } from "mongoose";

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */
export type ItemType = "Song" | "Album" | "Video";
export type ChartCategory = "songs" | "albums" | "videos";

export interface ChartStats {
  weeklyViews: number;
  totalViews: number;
  downloads: number;
  likes: number;
  shares: number;
  comments: number;
}

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
  stats: ChartStats;
  snippet?: { start: number; end: number };
}

/* ------------------------------------------------------------------ */
/* Trending Items Calculation */
/* ------------------------------------------------------------------ */
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

  const Model =
    model === "Song" ? Song : model === "Album" ? Album : Video;

  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - sinceDays);

  let rawItems = await Model.find({ createdAt: { $gte: sinceDate } }).lean();

  if (!rawItems.length) {
    console.warn(`[getTrending] No recent ${model}s found. Using fallback to all records.`);
    rawItems = await Model.find().lean();
  }

  const ids = rawItems.map((i) => i._id);

  // ✅ Fetch total views from analytics
  const viewsAgg = await ViewAnalytics.aggregate([
    { $match: { itemId: { $in: ids }, contentModel: model } },
    { $group: { _id: "$itemId", totalViews: { $sum: "$views" } } },
  ]);

  const viewMap = new Map<string, number>(
    viewsAgg.map((v) => [String(v._id), v.totalViews])
  );

  // ✅ Compute trending score
  const scored = rawItems.map((doc: any) => {
    const n = normalizeDoc(doc);
    const totalViews = viewMap.get(String(n._id)) ?? 0;
    const score =
      totalViews +
      (n.likeCount ?? 0) * 2 +
      (n.shareCount ?? 0) * 3 +
      (n.downloadCount ?? 0) * 1.5;
    return { ...n, trendingScore: score, viewCount: totalViews };
  });

  scored.sort((a, b) => b.trendingScore - a.trendingScore);
  return scored.slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* Build Charts with Accurate Stats */
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

  // ✅ Get trending items
  const trending = await getTrending({ model, limit: 200, sinceDays: 365 });
  if (!trending.length) return [];

  const thisWeek = `${dayjs().year()}-W${String(dayjs().isoWeek()).padStart(2, "0")}`;
  const lastWeek = `${dayjs().subtract(1, "week").year()}-W${String(
    dayjs().subtract(1, "week").isoWeek()
  ).padStart(2, "0")}`;

  // ✅ Get chart snapshots
  const [currentSnapshot, prevSnapshot] = await Promise.all([
    ChartHistory.findOne({ category, week: thisWeek }).lean<IChartHistory>(),
    ChartHistory.findOne({ category, week: lastWeek }).lean<IChartHistory>(),
  ]);

  const currentMap = new Map<string, any>(
    (currentSnapshot?.items ?? []).map((i) => [String(i.itemId), i])
  );
  const lastMap = new Map<string, any>(
    (prevSnapshot?.items ?? []).map((i) => [String(i.itemId), i])
  );

  // ✅ Weekly + All-Time View Stats
  const ids = trending.map((t) => t._id as unknown as Types.ObjectId);

const [weeklyViews, allTimeViews] = await Promise.all([
  // ✅ Match both `model` and `contentModel`
  ViewAnalytics.find({
    itemId: { $in: ids.map((id) => new Types.ObjectId(id)) },
    $or: [{ contentModel: model }, { model }],
    week: thisWeek,
  }).lean(),

  // ✅ Aggregate total views robustly
  ViewAnalytics.aggregate([
    {
      $match: {
        itemId: { $in: ids.map((id) => new Types.ObjectId(id)) },
        $or: [{ contentModel: model }, { model }],
      },
    },
    {
      $group: {
        _id: "$itemId",
        totalViews: { $sum: { $ifNull: ["$views", 0] } },
      },
    },
  ]),
]);


  const weeklyMap = new Map<string, number>(
    weeklyViews.map((v) => [String(v.itemId), v.views ?? 0])
  );
  const totalMap = new Map<string, number>(
    allTimeViews.map((v) => [String(v._id), v.totalViews ?? 0])
  );

  // ✅ Parallel getViewCounts
  const statsResults = await Promise.allSettled(
    trending.map((t) => {
      const objectId = new Types.ObjectId(String(t._id));
      return getViewCounts(objectId as any, model);
    })
  );

  // ✅ Build final chart items
  const items: ChartItem[] = trending.map((t, idx) => {
    const idStr = String(t._id);
    const cur = currentMap.get(idStr);
    const last = lastMap.get(idStr);

    const weeklyViewsCount = weeklyMap.get(idStr) ?? 0;
    const totalViewsFromAgg = totalMap.get(idStr) ?? t.viewCount ?? 0;
    const result = statsResults[idx];
    const totalViews =
      result.status === "fulfilled" ? result.value.totalViews : totalViewsFromAgg;

    return {
      id: idStr,
      title: t.title ?? "Untitled",
      artist: t.artist ?? "Unknown Artist",
      image: t.coverUrl ?? "",
      videoUrl: t.videoUrl ?? "",
      position: cur?.position ?? idx + 1,
      lastWeek: last?.position ?? null,
      peak: Math.min(cur?.peak ?? idx + 1, last?.peak ?? idx + 1),
      weeksOn: (cur?.weeksOn ?? 0) + 1,
      region,
      genre: t.genre ?? "Unknown",
      releaseDate: t.releaseDate ?? new Date().toISOString(),
      stats: {
        weeklyViews: weeklyViewsCount,
        totalViews,
        downloads: t.downloadCount ?? 0,
        likes: t.likeCount ?? 0,
        shares: t.shareCount ?? 0,
        comments: t.commentCount ?? 0,
      },
    };
  });

  // ✅ Sorting Logic
  switch (sort) {
    case "this-week":
      items.sort((a, b) => b.stats.weeklyViews - a.stats.weeklyViews);
      break;
    case "last-week":
      items.sort((a, b) => (a.lastWeek ?? 999) - (b.lastWeek ?? 999));
      break;
    default:
      items.sort((a, b) => b.stats.totalViews - a.stats.totalViews);
  }

  // ✅ Emit real-time chart updates
  if (globalThis.io && items.length > 0) {
    globalThis.io.emit("charts:update:category", { category, items });
    for (const item of items) {
      globalThis.io.emit("charts:update:item", {
        id: item.id,
        newPos: item.position,
      });
    }
  }

  return items.slice(0, limit);
}
