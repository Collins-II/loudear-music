// app/actions/getRelatedSongs.ts
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/database";
import { BeatSerialized, serializeBeat } from "./getItemsWithStats";
import Beat from "@/lib/database/models/beat";

/**
 * Fetch related songs based on genre, excluding the current song,
 * including aggregated views count.
 */
export const getRelatedBeats = async (
  genre: string | undefined,
  excludeId: string
): Promise<BeatSerialized[]> => {
  if (!genre) return [];

  if (!Types.ObjectId.isValid(excludeId)) {
    throw new Error("Invalid MongoDB ObjectId");
  }

  // ✅ Ensure DB connection
  await connectToDatabase();

  // Step 1: Fetch related songs
  const songs = await Beat.find({
    genre,
    _id: { $ne: excludeId },
  })
    .limit(5)
    .lean({ virtuals: true })
    .exec();

  if (!songs.length) return [];

  // Use analytics-based serialization
  const serialized = await Promise.all(songs.map((s) => serializeBeat(s)));
  return serialized.filter(Boolean);
};
