import { connectToDatabase } from "@/lib/database";
import { IVideo, Video } from "@/lib/database/models/video";
import { getCurrentUser } from "./getCurrentUser";


/**
 * Fetch songs and format them for the DataTable
 */
export const getUserVideos = async () => {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();

    const videos = await Video.find({ author: currentUser?._id}).lean<IVideo[]>();

    if (!videos) {
        return []
    }

    // Normalize to match DataTable schema
    return videos.map((video, index) => ({
      id: index + 1, // DataTable expects number ID
      itemId: video._id,
      artist: video.artist,
      title: video.title,
      cover: video.thumbnailUrl,
      plays: video.views.length, // placeholder until you track plays
      downloads: video.downloads.length,
      genre: video.genre, // placeholder until you track downloads
      status: true,
      feature: video.artist,
      duration: video.duration ? `${video.duration}s` : "N/A",
      releaseDate: video.createdAt
        ? new Date(video.createdAt).toISOString().split("T")[0]
        : "",
    }));
  } catch (error) {
    console.log("[GET_VIDEOS_ERR]", error);
    throw new Error("Failed to fetch videos");
  }
};
