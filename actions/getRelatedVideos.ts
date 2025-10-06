import { connectToDatabase } from "@/lib/database";
import { Video } from "@/lib/database/models/video";
import { VideoSerialized } from "./getItemsWithStats";

export async function getRelatedVideos(
  genre: string,
  excludeId: string
): Promise<VideoSerialized[]> {
  await connectToDatabase();

  const videos = await Video.find({
    genre,
    _id: { $ne: excludeId },
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return videos.map((v:any) => ({
    _id: v._id.toString(),
    title: v.title,
    artist: v.artist,
    genre: v.genre || "Unknown",
    description: v.description || "",
    tags: v.tags || [],
    coverUrl: v.thumbnailUrl,
    fileUrl: v.videoUrl || "",
    videographer: v.videographer || "Unknown",
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
    viewCount: v.views?.length || 0,
    likeCount: v.likes?.length || 0,
    downloadCount: v.downloads?.length || 0,
    shareCount: v.shares?.length || 0,
    commentCount: v.commentCount || 0,
    latestComments: v.latestComments || [],
  }));
}
