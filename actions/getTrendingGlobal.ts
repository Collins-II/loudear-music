import { connectToDatabase } from "@/lib/database";
import { Song } from "@/lib/database/models/song";
import { Album } from "@/lib/database/models/album";
import { Video } from "@/lib/database/models/video";
import { normalizeDoc } from "@/lib/utils";
import { getCurrentUser } from "./getCurrentUser";

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

/* --------------------------------------------------
   GLOBAL TRENDING (ALL USERS)
-------------------------------------------------- */
export async function getTrendingGlobal({
  limit,
  sinceDays,
}: {
  limit: number;
  sinceDays: number;
}) {
  await connectToDatabase();

  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - sinceDays);

  // Helper to fetch and score any model
  const fetchAndScore = async (Model: any, modelName: ItemType) => {
    let items = await Model.find({ createdAt: { $gte: sinceDate } })
      .lean()
      .exec();

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

  const [songs, albums, videos] = await Promise.all([
    fetchAndScore(Song, "Song"),
    fetchAndScore(Album, "Album"),
    fetchAndScore(Video, "Video"),
  ]);

  const combined: TrendingItem[] = [...songs, ...albums, ...videos];
  combined.sort((a, b) => b.trendingScore - a.trendingScore);

  // Limit to requested top N
  const topTrends = combined.slice(0, limit);

  // Normalize for UI
  return topTrends.map((item, index) => ({
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
}

/* --------------------------------------------------
   GLOBAL TRENDING BY SPECIFIC USER
-------------------------------------------------- */
export async function getTrendingByUserGlobal({
  limit,
  sinceDays,
}: {
  limit: number;
  sinceDays: number;
}) {
  await connectToDatabase();
  const user = await getCurrentUser();
  const userId = user?._id;

  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - sinceDays);

  // Helper to fetch & score models belonging to a user
  const fetchAndScoreUser = async (
    Model: any,
    modelName: ItemType,
    userField: string
  ) => {
    const query = {
      [userField]: userId,
      createdAt: { $gte: sinceDate },
    };

    let items = await Model.find(query).lean().exec();

    // fallback if not enough recent items
    if (!Array.isArray(items) || items.length < 3) {
      console.warn(
        `[getTrendingByUserGlobal] ${modelName}: fallback to all-time for user`
      );
      items = await Model.find({ [userField]: userId }).lean().exec();
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

  // Map user ownership field
  const SONG_USER_FIELD = "author";
  const ALBUM_USER_FIELD = "author";
  const VIDEO_USER_FIELD = "author";

  const [songs, albums, videos] = await Promise.all([
    fetchAndScoreUser(Song, "Song", SONG_USER_FIELD),
    fetchAndScoreUser(Album, "Album", ALBUM_USER_FIELD),
    fetchAndScoreUser(Video, "Video", VIDEO_USER_FIELD),
  ]);

  const combined = [...songs, ...albums, ...videos];

  // Global ranking for this user
  combined.sort((a, b) => b.trendingScore - a.trendingScore);

  const topUserTrends = combined.slice(0, limit);

  return topUserTrends.map((item, index) => ({
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
}
