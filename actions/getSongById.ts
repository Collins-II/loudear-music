import { Types, Document } from "mongoose";
import { connectToDatabase } from "@/lib/database";
import { Comment } from "@/lib/database/models/comment"; // 👈 ensures Comment is registered
import { Song } from "@/lib/database/models/song";
import { Album } from "@/lib/database/models/album";
import { Video } from "@/lib/database/models/video";

export type ItemType = "Song" | "Album" | "Video";
type InteractionType = "view" | "like" | "download" | "share" | "unlike";

// Reaction types
export type ReactionType = "heart" | "fire" | "laugh" | "up" | "down";

interface IInteractionDoc extends Document {
  _id: Types.ObjectId;
  likes: Types.ObjectId[];
  views: Types.ObjectId[];
  downloads: Types.ObjectId[];
  shares: Types.ObjectId[];
}


// CommentSerialized
export interface CommentSerialized {
  _id: string;
  user: {
    _id: string;
    name: string;
    image?: string;
  };
  content: string;
  targetModel: "Song" | "Album" | "Video" | "Post";
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

// BaseSerialized
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
  coverUrl: string;
  genre: string;
  tags: string[];
  description: string;
  viewCount: number;
  downloadCount: number;
}

export interface AlbumSerialized extends BaseSerialized {
  curator: string;
  songs?: SongSerialized[];
}

export interface VideoSerialized extends BaseSerialized {
  fileUrl: string;
  videographer: string;
  genre: string;
  releaseDate?: string | null;
}

/**
 * Comment serializer (recursive for replies)
 */
function serializeComments(comments: any[] = []): CommentSerialized[] {
  return comments.map((c) => ({
    _id: c._id.toString(),
    user: {
      _id: c.user?._id?.toString?.() ?? "",
      name: c.user?.name ?? "Unknown",
      image: c.user?.image ?? undefined,
    },
    content: c.content,
    targetModel: c.targetModel,
    targetId: c.targetId?.toString?.() ?? "",
    parent: c.parent ? c.parent.toString() : null,
    likes: c.likes?.map((id: any) => id.toString()) ?? [],
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
    createdAt: c.createdAt ?? new Date(),
    updatedAt: c.updatedAt ?? new Date(),
  }));
}

/**
 * Serialize Song/Album/Video into a plain object
 */
export function serializeItem(doc: any, type: ItemType) {
  if (!doc) return null;

  const base: BaseSerialized = {
    _id: doc._id.toString(),
    artist: doc.artist || "Unknown Artist",
    title: doc.title || "Untitled",
    genre: doc.genre || "Unknown",
    description: doc.description || "",
    tags: doc.tags || [],
    coverUrl: doc.coverUrl || "",
    createdAt: doc.createdAt ?? new Date(),
    updatedAt: doc.updatedAt ?? new Date(),
    viewCount: doc.views?.length ,
    likeCount: doc.likes?.length ,
    downloadCount: doc.downloads?.length ,
    shareCount: doc.shares?.length ,
    commentCount: doc.commentCount ,
    latestComments: serializeComments(doc.latestComments || []),
  };

  switch (type) {
    case "Song":
      return {
        ...base,
        album: doc.album || null,
        language: doc.language || null,
        releaseDate: doc.releaseDate
          ? doc.releaseDate
          : null,
        fileUrl: doc.fileUrl || "",
        genre: doc.genre,
      } as SongSerialized;

    case "Album":
      return {
        ...base,
        curator: doc.curator || "Unknown",
        songs: doc.songs?.map((s: any) => serializeItem(s, "Song")),
      } as AlbumSerialized;

    case "Video":
      return {
        ...base,
        fileUrl: doc.videoUrl || "",
        coverUrl: doc.thumbnailUrl || "",
        videographer: doc.videographer || "Unknown",
        genre: doc.genre || "Unknown",
        releaseDate: doc.releaseDate
          ? doc.releaseDate
          : null,
      } as VideoSerialized;
  }
}

export function serializeSong(doc: any) {
  return serializeItem(doc, "Song") as SongSerialized | null;
}

interface TrendingOptions {
  model: ItemType;
  limit?: number;
  sinceDays?: number; // consider recent activity
}

export async function getTrending({ model, limit, sinceDays = 7 }: TrendingOptions) {
  await connectToDatabase();

  let Model;
  switch (model) {
    case "Song":
      Model = Song;
      break;
    case "Album":
      Model = Album;
      break;
    case "Video":
      Model = Video;
      break;
    default:
      throw new Error("Invalid model type");
  }

  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - sinceDays);

  // Fetch items created recently with basic stats
  const items = await Model.find({
    createdAt: { $gte: sinceDate },
  })
    .lean()
    .exec();

  // Compute trending score
  const scoredItems = items.map((item: any) => {
    const views = item.views?.length || 0;
    const likes = item.likes?.length || 0;
    const shares = item.shares?.length || 0;
    const downloads = item.downloads?.length || 0;

    const trendingScore = views + likes * 2 + shares * 3 + downloads * 1.5;

    return { ...item, trendingScore };
  });

  // Sort all items
  const sorted = scoredItems.sort((a, b) => b.trendingScore - a.trendingScore);

  // Add chartRank + isTrending (top 100 considered for chartRank)
  const withRank = sorted.slice(0, 100).map((item, index) => ({
    ...item,
    chartRank: index + 1,
    isTrending: index < 10, // top 10 flag
  }));

  // Apply limit for what we actually return
  const top = withRank.slice(0, limit);

  // Serialize for frontend
  return top.map((item) => ({
    ...serializeItem(item, model),
    chartRank: item.chartRank,
    isTrending: item.isTrending,
  }));
}

/**
 * Increment or toggle a user interaction
 */

export async function incrementInteraction(
  id: string,
  model: ItemType,
  type: InteractionType,
  userId?: string
) {
  if (!Types.ObjectId.isValid(id)) return null;

  try {
    await connectToDatabase();

    // Select model
    let Model;
    switch (model) {
      case "Song":
        Model = Song;
        break;
      case "Album":
        Model = Album;
        break;
      case "Video":
        Model = Video;
        break;
      default:
        throw new Error("Invalid model type");
    }

    const field = `${type}s` as "likes" | "views" | "downloads" | "shares";
    const userObjectId = userId ? new Types.ObjectId(userId) : new Types.ObjectId();

    // Like toggle
    if (type === "like" && userId) {
      const alreadyLiked = await Model.exists({ _id: id, [field]: userObjectId });
      if (alreadyLiked) {
        await Model.updateOne({ _id: id }, { $pull: { [field]: userObjectId } });
      } else {
        await Model.updateOne({ _id: id }, { $addToSet: { [field]: userObjectId } });
      }
    } else {
      await Model.updateOne({ _id: id }, { $push: { [field]: userObjectId } });
    }

    // ✅ Cast result properly
    const updated = (await Model.findById(id).lean()) as IInteractionDoc | null;

    if (globalThis.io && updated) {
      globalThis.io.to(`${model}:${id}`).emit("interaction:update", {
        itemId: id,
        model,
        type,
        counts: {
          likes: updated.likes?.length || 0,
          views: updated.views?.length || 0,
          downloads: updated.downloads?.length || 0,
          shares: updated.shares?.length || 0,
        },
      });
    }

    // Trending refresh
    if (globalThis.io) {
      const [songs, albums, videos] = await Promise.all([
        getTrending({ model: "Song", limit: 10 }),
        getTrending({ model: "Album", limit: 10 }),
        getTrending({ model: "Video", limit: 10 }),
      ]);
      globalThis.io.emit("trending:update", { songs, albums, videos });
    }

    return updated;
  } catch (error) {
    console.error("INTERACTION_ERROR", error);
    throw error;
  }
}



/**
 * Helper: fetch nested comments with recursive population
 */
async function fetchNestedComments(targetId: string, model: ItemType, limit = 3) {
  const comments = await Comment.find({
    targetId,
    targetModel: model,
    parent: null,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("user", "_id name image")
    .populate({
      path: "replies",
      populate: [
        { path: "user", select: "_id name image" },
        {
          path: "replies",
          populate: [
            { path: "user", select: "_id name image" },
            { path: "replies", populate: { path: "user", select: "_id name image" } },
          ],
        },
      ],
    })
    .lean();

  return serializeComments(comments);
}

/**
 * Generic fetcher with stats + comments
 */
export async function getItemWithStats(model: ItemType, id: string) {
  if (!Types.ObjectId.isValid(id)) throw new Error("Invalid MongoDB ObjectId");

  await connectToDatabase();

  let Model;
  switch (model) {
    case "Song":
      Model = Song;
      break;
    case "Album":
      Model = Album;
      break;
    case "Video":
      Model = Video;
      break;
    default:
      throw new Error("Invalid model type");
  }

  // fetch doc
  let query = Model.findById(new Types.ObjectId(id));
  if (model === "Album") {
    query = query.populate("songs");
  }

  const doc = await query.lean();
  if (!doc) return null;

  // compute comments + populate nested replies
  const commentCount = await Comment.countDocuments({
    targetId: id,
    targetModel: model,
  });

  const latestComments = await fetchNestedComments(id, model, 3);

  return serializeItem(
    {
      ...doc,
      commentCount,
      latestComments,
    },
    model
  );
}

/**
 * Shortcuts
 */
export const getSongWithStats = (id: string) => getItemWithStats("Song", id);
export const getAlbumWithStats = (id: string) => getItemWithStats("Album", id);
export const getVideoWithStats = (id: string) => getItemWithStats("Video", id);
