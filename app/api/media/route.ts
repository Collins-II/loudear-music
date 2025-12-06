import { connectToDatabase } from "@/lib/database";
import { Album } from "@/lib/database/models/album";
import { Song } from "@/lib/database/models/song";
import { Video } from "@/lib/database/models/video";
import { NextRequest, NextResponse } from "next/server";

// Utility: sanitize limit
const parseLimit = (limit: string | undefined) => {
  const num = Number(limit);
  if (isNaN(num) || num <= 0) return 100;
  return Math.min(num, 100);
};

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { searchParams } = req.nextUrl;
  const limit = parseLimit(searchParams.get("limit") as string);
  const type = searchParams.get("type"); // song | album | video
  const genre = searchParams.get("genre");
  const artist = searchParams.get("artist");

  // Helper for building query
  const buildQuery = (typeName: "song" | "album" | "video") => {
    const q: any = { visibility: "public" };
    if (genre) q.genre = genre;
    if (artist) q.artist = artist;
    return q;
  };

  try {
    let results: any[] = [];

    if (!type || type === "song") {
      const songs = await Song.find(buildQuery("song"))
        .limit(limit)
        .sort({ createdAt: -1 })
        .select("_id title artist genre fileUrl coverUrl duration album createdAt")
        .lean({ virtuals: true });
      results = results.concat(
        songs.map((s) => ({ ...s, mediaType: "song" }))
      );
    }

    if (!type || type === "album") {
      const albums = await Album.find(buildQuery("album"))
        .limit(limit)
        .sort({ createdAt: -1 })
        .select("_id title artist genre coverUrl releaseDate totalSongs createdAt")
        .lean({ virtuals: true });
      results = results.concat(
        albums.map((a) => ({ ...a, mediaType: "album" }))
      );
    }

    if (!type || type === "video") {
      const videos = await Video.find(buildQuery("video"))
        .limit(limit)
        .sort({ createdAt: -1 })
        .select("_id title artist genre videoUrl thumbnailUrl duration createdAt")
        .lean({ virtuals: true });
      results = results.concat(
        videos.map((v) => ({ ...v, mediaType: "video" }))
      );
    }

    // Optional: shuffle results for variety
    results.sort(() => 0.5 - Math.random());

    return NextResponse.json({ media: results.slice(0, limit), total: results.length });
  } catch (err: any) {
    console.error("Failed to fetch media:", err);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}
