// app/actions/getRelatedAlbums.ts
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/database";
import { Album } from "@/lib/database/models/album";
import { AlbumSerialized, serializeAlbum } from "./getItemsWithStats";

/**
 * Fetch related albums based on genre, excluding the current album,
 * including aggregated views count.
 */
export const getRelatedAlbums = async (
  genre: string | undefined,
  excludeId: string
): Promise<AlbumSerialized[]> => {
  if (!genre) return [];

  if (!Types.ObjectId.isValid(excludeId)) {
    throw new Error("Invalid MongoDB ObjectId");
  }

  await connectToDatabase();

  const albums = await Album.find({
    genre,
    _id: { $ne: excludeId },
  })
    .limit(5)
    .lean({ virtuals: true })
    .exec();

  if (!albums.length) return [];

// Use analytics-based serialization
  const serialized = await Promise.all(albums.map((s) => serializeAlbum(s)));
  return serialized.filter(Boolean);
};
