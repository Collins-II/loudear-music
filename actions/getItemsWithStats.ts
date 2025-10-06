import { Types, Document, FlattenMaps } from "mongoose";
import { connectToDatabase } from "@/lib/database";
import { Comment } from "@/lib/database/models/comment";
import { Song } from "@/lib/database/models/song";
import { Album } from "@/lib/database/models/album";
import { Video } from "@/lib/database/models/video";
import { ChartHistory } from "@/lib/database/models/chartHistory";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */
export type ItemType = "Song" | "Album" | "Video";
type InteractionType = "view" | "like" | "download" | "share" | "unlike";
export type ReactionType = "heart" | "fire" | "laugh" | "up" | "down";

interface ChartItem {
  itemId: Types.ObjectId;
  position: number;
  peak?: number;
  weeksOn?: number;
}

interface ChartHistoryDoc {
  week: string;
  category: string;
  items: ChartItem[];
}

type ChartHistoryLean = FlattenMaps<ChartHistoryDoc> & {
  _id: Types.ObjectId;
  __v?: number;
};

interface IInteractionDoc extends Document {
  _id: Types.ObjectId;
  likes: Types.ObjectId[];
  views: Types.ObjectId[];
  downloads: Types.ObjectId[];
  shares: Types.ObjectId[];
}

/* ------------------------------------------------------------------ */
/* COMMENT SERIALIZATION */
/* ------------------------------------------------------------------ */
export interface CommentSerialized {
  _id: string;
  user: { _id: string; name: string; image?: string };
  content: string;
  targetModel: ItemType | "Post";
  targetId: string;
  parent?: string | null;
  likes: string[];
  likeCount: number;
  replyCount: number;
  reactions: Record<ReactionType, number>;
  replies?: CommentSerialized[];
  createdAt: string;
  updatedAt: string;
}

function serializeComments(comments: any[] = []): CommentSerialized[] {
  return comments.map((c) => ({
    _id: String(c._id ?? ""),
    user: {
      _id: String(c.user?._id ?? ""),
      name: c.user?.name ?? "Unknown",
      image: c.user?.image ?? undefined,
    },
    content: c.content ?? "",
    targetModel: c.targetModel ?? "Song",
    targetId: String(c.targetId ?? ""),
    parent: c.parent ? String(c.parent) : null,
    likes: (c.likes ?? []).map((id: any) => String(id)),
    likeCount: c.likes?.length ?? 0,
    replyCount: c.replies?.length ?? 0,
    reactions: c.reactions ?? {
      heart: 0,
      fire: 0,
      laugh: 0,
      up: 0,
      down: 0,
    },
    replies: c.replies ? serializeComments(c.replies) : [],
    createdAt: c.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: c.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  }));
}

/* ------------------------------------------------------------------ */
/* BASE + ITEM SERIALIZATION */
/* ------------------------------------------------------------------ */
export interface BaseSerialized {
  _id: string;
  artist: string;
  title: string;
  genre: string;
  description?: string;
  tags: string[];
  coverUrl: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  downloadCount: number;
  shareCount: number;
  commentCount: number;
  latestComments: CommentSerialized[];
}

export interface SongSerialized extends BaseSerialized {
  album?: string | null;
  language?: string | null;
  releaseDate?: string | null;
  fileUrl: string;
  trendingPosition?: number | null;
  chartPosition?: number | null;
  chartHistory?: { week: string; position: number; peak?: number; weeksOn?: number }[];
  trendingScore?: number | null;
}

export interface AlbumSerialized extends BaseSerialized {
  curator: string;
  songs?: SongSerialized[];
  trendingPosition?: number | null;
  chartPosition?: number | null;
  chartHistory?: { week: string; position: number; peak?: number; weeksOn?: number }[];
  trendingScore?: number | null;
}

export interface VideoSerialized extends BaseSerialized {
  fileUrl: string;
  videographer: string;
  trendingPosition?: number | null;
  chartPosition?: number | null;
  chartHistory?: { week: string; position: number; peak?: number; weeksOn?: number }[];
  trendingScore?: number | null;
  releaseDate?: string | null;
}

export function serializeItem<T extends ItemType>(
  doc: any,
  type: T
): T extends "Song"
  ? SongSerialized
  : T extends "Album"
  ? AlbumSerialized
  : VideoSerialized | null {
  if (!doc) return null as any;

  const base: BaseSerialized = {
    _id: String(doc._id),
    artist: doc.artist ?? "Unknown Artist",
    title: doc.title ?? "Untitled",
    genre: doc.genre ?? "Unknown",
    description: doc.description ?? "",
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    coverUrl: doc.coverUrl ?? doc.thumbnailUrl ?? "",
    createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    viewCount: doc.views?.length ?? doc.viewCount ?? 0,
    likeCount: doc.likes?.length ?? doc.likeCount ?? 0,
    downloadCount: doc.downloads?.length ?? doc.downloadCount ?? 0,
    shareCount: doc.shares?.length ?? doc.shareCount ?? 0,
    commentCount: doc.commentCount ?? 0,
    latestComments: serializeComments(doc.latestComments ?? []),
  };

  if (type === "Song")
    return {
      ...base,
      album: doc.album ?? null,
      language: doc.language ?? null,
      releaseDate: doc.releaseDate ?? null,
      fileUrl: doc.fileUrl ?? "",
    } as any;

  if (type === "Album")
    return {
      ...base,
      curator: doc.curator ?? "Unknown",
      songs: (doc.songs ?? []).map((s: any) => serializeItem(s, "Song")) as SongSerialized[],
    } as any;

  return {
    ...base,
    fileUrl: doc.videoUrl ?? doc.fileUrl ?? "",
    videographer: doc.videographer ?? "Unknown",
    releaseDate: doc.releaseDate ?? null,
  } as any;
}

export const serializeSong = (doc: any) => serializeItem(doc, "Song") as SongSerialized;
export const serializeAlbum = (doc: any) => serializeItem(doc, "Album") as AlbumSerialized;
export const serializeVideo = (doc: any) => serializeItem(doc, "Video") as VideoSerialized;

/* ------------------------------------------------------------------ */
/* INCREMENT INTERACTION */
/* ------------------------------------------------------------------ */
export async function incrementInteraction(
  id: string,
  model: ItemType,
  type: InteractionType,
  userId?: string
) {
  if (!Types.ObjectId.isValid(id)) throw new Error("Invalid ObjectId");
  await connectToDatabase();

  const Model = model === "Song" ? Song : model === "Album" ? Album : Video;
  const fieldMap: Record<Exclude<InteractionType, "unlike">, keyof IInteractionDoc> = {
    view: "views",
    like: "likes",
    download: "downloads",
    share: "shares",
  };

  if (type === "unlike") {
    await Model.updateOne(
      { _id: id },
      { $pull: { likes: new Types.ObjectId(userId) } }
    );
    return { success: true, action: "unliked" };
  }

  const field = fieldMap[type];
  if (!field) throw new Error(`Unsupported interaction type: ${type}`);

  await Model.updateOne(
    { _id: id },
    { $addToSet: { [field]: new Types.ObjectId(userId) } }
  );

  return { success: true, action: type };
}

/* ------------------------------------------------------------------ */
/* DYNAMIC STATS FETCHER */
/* ------------------------------------------------------------------ */
export async function getItemWithStats(model: ItemType, id: string) {
  if (!Types.ObjectId.isValid(id)) throw new Error("Invalid ObjectId");
  await connectToDatabase();

  const Model = model === "Song" ? Song : model === "Album" ? Album : Video;

  // For albums, populate songs for deeper analytics
  let query = Model.findById(id);
  if (model === "Album") {
    query = query.populate({
      path: "songs",
      select: "_id title artist coverUrl fileUrl views likes downloads shares genre releaseDate",
    });
  }

  const doc = await query.lean();
  if (!doc) return null;

  // Comments
  const [commentCount, latestComments] = await Promise.all([
    Comment.countDocuments({ targetId: id, targetModel: model }),
    Comment.find({ targetId: id, targetModel: model, parent: null })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("user", "_id name image")
      .lean()
      .then((res) => serializeComments(res)),
  ]);

  // Trending score within recent period
  const sinceDate = dayjs().subtract(14, "day").toDate();
  const recentItems = await Model.find({ createdAt: { $gte: sinceDate } })
    .select("_id views likes shares downloads")
    .lean();

  const scored = recentItems
    .map((i) => ({
      _id: i._id,
      trendingScore:
        (i.views?.length ?? 0) +
        (i.likes?.length ?? 0) * 2 +
        (i.shares?.length ?? 0) * 3 +
        (i.downloads?.length ?? 0) * 1.5,
    }))
    .sort((a, b) => b.trendingScore - a.trendingScore);

  const trendingIndex = scored.findIndex((s) => String(s._id) === id);
  const trendingPosition = trendingIndex >= 0 ? trendingIndex + 1 : null;

  // Chart data
  const currentWeek = `${dayjs().year()}-W${String(dayjs().isoWeek()).padStart(2, "0")}`;
  const chartSnapshot = (await ChartHistory.findOne({
    category: model.toLowerCase() + "s",
    week: currentWeek,
  })
    .select("items week category")
    .lean()) as ChartHistoryLean | null;

  const chartPosition =
    chartSnapshot?.items?.find((i) => String(i.itemId) === id)?.position ?? null;

  const chartHistoryDocs = (await ChartHistory.find({
    "items.itemId": new Types.ObjectId(id),
  })
    .sort({ week: -1 })
    .limit(12)
    .lean()) as ChartHistoryLean[];

  const chartHistory =
    chartHistoryDocs
      .map((snap) => {
        const item = snap.items.find((it) => String(it.itemId) === id);
        return item
          ? {
              week: snap.week,
              position: item.position,
              peak: item.peak ?? item.position,
              weeksOn: item.weeksOn ?? 1,
            }
          : null;
      })
      .filter(Boolean) ?? [];

  // Serialize
  const serialized = serializeItem(
    { ...doc, commentCount, latestComments },
    model
  ) as SongSerialized | AlbumSerialized | VideoSerialized;

  return {
    ...serialized,
    trendingPosition,
    chartPosition,
    chartHistory,
    trendingScore:
      trendingIndex >= 0 ? scored[trendingIndex].trendingScore : null,
  };
}

/* ------------------------------------------------------------------ */
/* SHORTCUTS */
/* ------------------------------------------------------------------ */
export const getSongWithStats = (id: string) => getItemWithStats("Song", id);
export const getAlbumWithStats = (id: string) => getItemWithStats("Album", id);
export const getVideoWithStats = (id: string) => getItemWithStats("Video", id);
