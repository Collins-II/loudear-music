// app/actions/getRelatedSongs.ts
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/database";
import { AlbumSerialized, serializeAlbum} from "./getItemsWithStats";
import { Album } from "@/lib/database/models/album";

/**
 * Fetch related songs based on genre, excluding the current song
 */
export const getRelatedAlbums = async (
  genre: string | undefined,
  excludeId: string
): Promise<AlbumSerialized[]> => {
  if (!genre) return [];

  if (!Types.ObjectId.isValid(excludeId)) {
    throw new Error("Invalid MongoDB ObjectId");
  }

  // ✅ Ensure DB connection
  await connectToDatabase();

  const songs = await Album.find({
    genre,
    _id: { $ne: excludeId },
  })
    .limit(5) // return top 5 related songs
    .lean({ virtuals: true })
    .exec();

  // ✅ Serialize each song for client
  return songs.map(serializeAlbum).filter(Boolean) as AlbumSerialized[];
};
