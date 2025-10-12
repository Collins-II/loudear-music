// app/actions/getRelatedSongs.ts
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/database";
import { Song } from "@/lib/database/models/song";
import { SongSerialized, serializeSong } from "./getItemsWithStats";

/**
 * Fetch related songs based on genre, excluding the current song,
 * including aggregated views count.
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

  // Step 1: Fetch related songs
  const songs = await Song.find({
    genre,
    _id: { $ne: excludeId },
  })
    .limit(5)
    .lean({ virtuals: true })
    .exec();

  if (!songs.length) return [];

  // Use analytics-based serialization
  const serialized = await Promise.all(songs.map((s) => serializeSong(s)));
  return serialized.filter(Boolean);
};
