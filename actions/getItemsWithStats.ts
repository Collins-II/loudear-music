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

export interface ChartItem {
  itemId: Types.ObjectId;
  position: number;
  peak?: number;
  weeksOn?: number;
}

export interface ChartHistoryDoc {
  week: string;
  category: string;
  items: ChartItem[];
}

export type ChartHistoryLean = FlattenMaps<ChartHistoryDoc> & {
  _id: Types.ObjectId;
  __v?: number;
};

export interface IInteractionDoc extends Document {
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

function serializeComments(comments: unknown[] = []): CommentSerialized[] {
  return (comments as any[]).map((c) => ({
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
    likeCount: Array.isArray(c.likes) ? c.likes.length : 0,
    replyCount: Array.isArray(c.replies) ? c.replies.length : 0,
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

export interface ChartHistoryEntry {
  week: string;
  position: number;
  peak?: number;
  weeksOn?: number;
}

export interface SongSerialized extends BaseSerialized {
  album?: string | null;
  language?: string | null;
  releaseDate?: string | null;
  fileUrl: string;
  trendingPosition?: number | null;
  chartPosition?: number | null;
  chartHistory?: ChartHistoryEntry[];
  trendingScore?: number | null;
}

export interface AlbumSerialized extends BaseSerialized {
  curator: string;
  songs?: SongSerialized[];
  trendingPosition?: number | null;
  chartPosition?: number | null;
  chartHistory?: ChartHistoryEntry[];
  trendingScore?: number | null;
}

export interface VideoSerialized extends BaseSerialized {
  fileUrl: string;
  videographer: string;
  trendingPosition?: number | null;
  chartPosition?: number | null;
  chartHistory?: ChartHistoryEntry[];
  trendingScore?: number | null;
  releaseDate?: string | null;
}

/* ------------------------------------------------------------------ */
/* SERIALIZE ITEM */
/* ------------------------------------------------------------------ */
export function serializeItem<T extends ItemType>(
  doc: Record<string, any>,
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

export const serializeSong = (doc: unknown) => serializeItem(doc as Record<string, any>, "Song") as SongSerialized;
export const serializeAlbum = (doc: unknown) => serializeItem(doc as Record<string, any>, "Album") as AlbumSerialized;
export const serializeVideo = (doc: unknown) => serializeItem(doc as Record<string, any>, "Video") as VideoSerialized;

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
    await Model.updateOne({ _id: id }, { $pull: { likes: new Types.ObjectId(userId) } });
    return { success: true, action: "unliked" as const };
  }

  const field = fieldMap[type];
  if (!field) throw new Error(`Unsupported interaction type: ${type}`);

  await Model.updateOne({ _id: id }, { $addToSet: { [field]: new Types.ObjectId(userId) } });

  return { success: true, action: type as Exclude<InteractionType, "unlike"> };
}

/* ------------------------------------------------------------------ */
/* DYNAMIC STATS FETCHER */
/* ------------------------------------------------------------------ */
export async function getItemWithStats(model: ItemType, id: string) {
  try {
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid ObjectId");
    await connectToDatabase();

    const Model = model === "Song" ? Song : model === "Album" ? Album : Video;

    let query = Model.findById(id);
    if (model === "Album") {
      query = query.populate({
        path: "songs",
        select: "_id title artist coverUrl fileUrl views likes downloads shares genre releaseDate",
      });
    }

    const doc = await query.lean<Record<string, any>>();
    if (!doc) return null;

    /* --------------------------- COMMENTS --------------------------- */
    const [commentCountRes, latestCommentsRes] = await Promise.allSettled([
      Comment.countDocuments({ targetId: id, targetModel: model }),
      Comment.find({ targetId: id, targetModel: model, parent: null })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate([
          { path: "user", select: "_id name image" },
          {
            path: "replies",
            populate: { path: "user", select: "_id name image" },
            options: { sort: { createdAt: 1 }, limit: 5 },
          },
        ])
        .lean(),
    ]);

    const commentCount =
      commentCountRes.status === "fulfilled" ? commentCountRes.value : 0;
    const latestComments =
      latestCommentsRes.status === "fulfilled"
        ? serializeComments(latestCommentsRes.value)
        : [];

    /* --------------------------- ANALYTICS --------------------------- */
    const sinceDate = dayjs().subtract(365, "day").toDate();
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
    const trendingScore =
      trendingIndex >= 0 ? scored[trendingIndex].trendingScore : null;

    const currentWeek = `${dayjs().year()}-W${String(dayjs().isoWeek()).padStart(2, "0")}`;
    const chartSnapshot = await ChartHistory.findOne({
      category: model.toLowerCase() + "s",
      week: currentWeek,
    })
      .select("items week category")
      .lean<ChartHistoryLean | null>();

    const chartPosition =
      chartSnapshot?.items?.find((i) => String(i.itemId) === id)?.position ?? null;

    const chartHistoryDocs = await ChartHistory.find({
      "items.itemId": new Types.ObjectId(id),
    })
      .sort({ week: -1 })
      .limit(12)
      .lean<ChartHistoryLean[]>();

  const chartHistory = chartHistoryDocs
  .map((snap) => {
    const item = snap.items.find((it) => String(it.itemId) === id);
    if (!item) return undefined;
    return {
      week: snap.week,
      position: item.position,
      peak: item.peak ?? item.position,
      weeksOn: item.weeksOn ?? 1,
    } as ChartHistoryEntry;
  })
  .filter((entry): entry is ChartHistoryEntry => Boolean(entry));


    /* --------------------------- SERIALIZE --------------------------- */
    const serialized = serializeItem(
      { ...doc, commentCount, latestComments },
      model
    ) as SongSerialized | AlbumSerialized | VideoSerialized;

    return {
      ...serialized,
      trendingPosition,
      chartPosition,
      chartHistory,
      trendingScore,
    };
  } catch (error: unknown) {
    console.error("GET_ITEMS_ERROR", error);

    const err = error as Error & { name?: string; message?: string };
    if (
      err?.name === "MongoNetworkError" ||
      err?.message?.includes("ECONNRESET") ||
      err?.message?.includes("pool was cleared")
    ) {
      console.warn("🔁 Retrying database connection...");
      try {
        await connectToDatabase();
        return await getItemWithStats(model, id);
      } catch (retryError) {
        console.error("❌ Retry failed:", retryError);
      }
    }

    return null;
  }
}

/* ------------------------------------------------------------------ */
/* SHORTCUTS */
/* ------------------------------------------------------------------ */
export const getSongWithStats = (id: string) => getItemWithStats("Song", id);
export const getAlbumWithStats = (id: string) => getItemWithStats("Album", id);
export const getVideoWithStats = (id: string) => getItemWithStats("Video", id);
