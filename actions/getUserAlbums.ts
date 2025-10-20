import { connectToDatabase } from "@/lib/database";
import { Album, IAlbum } from "@/lib/database/models/album";
import { ISong } from "@/lib/database/models/song";
import { getCurrentUser } from "./getCurrentUser";

/**
 * Fetch albums and format them for the DataTable
 */
export const getUserAlbums = async () => {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();

    // Populate songs for each album
    const albums = await Album.find({ author: currentUser?._id})
      .populate<{ songs: ISong[] }>("songs")
      .lean<IAlbum[]>();

    if (!albums) {
      return []
    }

    // Normalize to match DataTable schema
    return albums?.map((album, index) => ({
      id: index + 1, // DataTable expects number ID
      itemId: album._id,
      artist: album.artist,
      title: album.title,
      cover: album.coverUrl,
      plays: album.views.length, // placeholder until you have analytics
      downloads: album.downloads.length, 
      status: true,// placeholder
      genre: album.genre,
      feature: album.artist, // optional "feature" column
      duration: album.songs
        .filter((s): s is ISong => typeof s !== "string")
        .reduce((acc, song) => acc + (song.duration || 0), 0)
        .toString(),
      releaseDate: album.createdAt
        ? new Date(album.createdAt).toISOString().split("T")[0]
        : "",
    }));
  } catch (error) {
    console.error("[GET_ALBUMS_ERR]", error);
    throw new Error("Failed to fetch albums");
  }
};
