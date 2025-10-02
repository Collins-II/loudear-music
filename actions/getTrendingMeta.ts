import { connectToDatabase } from "@/lib/database";
import { Interaction } from "@/lib/database/models/interactions";

/**
 * Fetch the latest 16 songs and format them for the DataTable
 */
export const getTrendingSongs = async () => {
  try {
    await connectToDatabase();

   const trending = await Interaction.aggregate([
      { $match: { targetModel: "Song", type: "play" } },
      { $group: { _id: "$targetId", plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 10 }
    ]);

    if (!trending || trending.length === 0) {
      return [];
    }

    // Normalize to match DataTable schema
    return trending.map((song, index) => ({
      id: index + 1, // DataTable expects number ID
      title: song.title,
      cover: song.coverUrl,
      status: "Done", // placeholder
      plays: "0", // placeholder until you track plays
      downloads: "0", // placeholder until you track downloads
      feature: song.artist,
      // duration: song.duration ? `${song.duration}s` : "N/A",
      releaseDate: song.createdAt
        ? new Date(song.createdAt).toISOString().split("T")[0]
        : "",
    }));
  } catch (error) {
    console.error("[GET_SONGS_ERR]", error);
    throw new Error("Failed to fetch songs");
  }
};
