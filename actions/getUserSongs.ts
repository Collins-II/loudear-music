import { connectToDatabase } from "@/lib/database";
import { ISong, Song } from "@/lib/database/models/song";
import { getCurrentUser } from "./getCurrentUser";

/**
 * Fetch songs and format them for the DataTable
 */
export const getUserSongs = async () => {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();

    if (!currentUser?._id) return [];

    const songs = await Song.find({ author: currentUser._id }).lean<ISong[]>();

    if (!songs?.length) return [];

    // ✅ Sanitize and normalize fields
    return songs.map((song, index) => ({
      id: index + 1, // DataTable expects a simple number ID
      itemId: song._id as string, // ✅ convert ObjectId → string
      artist: song.artist || "",
      title: song.title || "",
      cover: song.coverUrl || "",
      plays: Array.isArray(song.views) ? song.views.length : 0,
      downloads: Array.isArray(song.downloads) ? song.downloads.length : 0,
      status: true,
      genre: song.genre || "Unknown",
      feature: song.features || [],
      duration: song.duration ? `${song.duration}s` : "N/A",
      releaseDate: song.createdAt
        ? new Date(song.createdAt).toISOString().split("T")[0]
        : "",
    }));
  } catch (error) {
    console.error("[GET_SONGS_ERR]", error);
    throw new Error("Failed to fetch songs");
  }
};
