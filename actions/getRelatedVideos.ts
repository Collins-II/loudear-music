// app/actions/getRelatedVideos.ts
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/database";
import { Video } from "@/lib/database/models/video";
import { serializeVideo, VideoSerialized } from "./getItemsWithStats";

export async function getRelatedVideos(
  genre: string,
  excludeId: string
): Promise<VideoSerialized[]> {
  if (!genre) return [];

  if (!Types.ObjectId.isValid(excludeId)) {
    throw new Error("Invalid MongoDB ObjectId");
  }

  await connectToDatabase();

  // Fetch related videos
  const videos = await Video.find({
    genre,
    _id: { $ne: excludeId },
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()
    .exec();

  if (!videos.length) return [];

  // Use analytics-based serialization
  const serialized = await Promise.all(videos.map((s) => serializeVideo(s)));
  return serialized.filter(Boolean) as VideoSerialized[];
}
