// app/actions/getRelatedSongs.ts
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/database";
import { Song } from "@/lib/database/models/song";
import { SongSerialized, serializeSong } from "./getItemsWithStats";

/**
 * Fetch related songs based on genre, excluding the current song
 */
export const getRelatedSongs = async (
  genre: string | undefined,
  excludeId: string
): Promise<SongSerialized[]> => {
  if (!genre) return [];

  if (!Types.ObjectId.isValid(excludeId)) {
    throw new Error("Invalid MongoDB ObjectId");
  }

  // ✅ Ensure DB connection
  await connectToDatabase();

  const songs = await Song.find({
    genre,
    _id: { $ne: excludeId },
  })
    .limit(5) // return top 5 related songs
    .lean({ virtuals: true })
    .exec();

  // ✅ Serialize each song for client
  return songs.map(serializeSong).filter(Boolean) as SongSerialized[];
};
