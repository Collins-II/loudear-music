import { connectToDatabase } from "@/lib/database";
import { Song } from "@/lib/database/models/song";
import { Album } from "@/lib/database/models/album";
import { Video } from "@/lib/database/models/video";
import { normalizeDoc } from "@/lib/utils";

type ItemType = "Song" | "Album" | "Video";

interface TrendingItem {
  _id: string;
  title: string;
  artist?: string;
  genre?: string;
  coverUrl?: string;
  model: ItemType;
  trendingScore: number;
  createdAt: Date;
  [key: string]: any;
}

export async function getTrendingGlobal({
  limit = 50,
  sinceDays = 7,
}: {
  limit?: number;
  sinceDays?: number;
}) {
  await connectToDatabase();

  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - sinceDays);

  // Helper to fetch and score any model
  const fetchAndScore = async (Model: any, modelName: ItemType) => {
    let items = await Model.find({ createdAt: { $gte: sinceDate } }).lean().exec();

    // fallback if not enough recent data
    if (!Array.isArray(items) || items.length < 5) {
      console.warn(`[getTrending] ${modelName}: fallback to all-time data`);
      items = await Model.find().lean().exec();
    }

    return items.map((it: any) => {
      const n = normalizeDoc(it);
      const score =
        (n.viewCount || 0) +
        (n.likeCount || 0) * 2 +
        (n.shareCount || 0) * 3 +
        (n.downloadCount || 0) * 1.5;
      return { ...n, model: modelName, trendingScore: score };
    });
  };

  // Fetch all types concurrently
  const [songs, albums, videos] = await Promise.all([
    fetchAndScore(Song, "Song"),
    fetchAndScore(Album, "Album"),
    fetchAndScore(Video, "Video"),
  ]);

  // Merge all into one array
  const combined: TrendingItem[] = [...songs, ...albums, ...videos];

  // Sort globally by score
  combined.sort((a, b) => b.trendingScore - a.trendingScore);

  // Limit to requested top N
  const topTrends = combined.slice(0, limit);

  // Optional: clean up shape for UI
  const normalized = topTrends.map((item, index) => ({
    id: item._id.toString(),
    title: item.title,
    artist: item.artist || item.creator || "Unknown Artist",
    cover:
      item.coverUrl ||
      item.coverImage ||
      item.image ||
      "/assets/images/placeholder_cover.jpg",
    genre: item.genre || "General",
    model: item.model,
    trendingScore: item.trendingScore,
    rank: index + 1,
    createdAt: item.createdAt,
  }));

  return normalized;
}
