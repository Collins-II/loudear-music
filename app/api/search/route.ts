import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { Song } from "@/lib/database/models/song";
import { Album } from "@/lib/database/models/album";
import { Video } from "@/lib/database/models/video";

/**
 * Search API
 * Supports searching songs, albums, and videos (or all combined)
 * Query params:
 * - q: string (required)
 * - type: "songs" | "albums" | "videos" | "all" (optional)
 * - limit: number (default 20)
 */
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();
    const type = searchParams.get("type")?.toLowerCase(); // songs, albums, videos, or "all"
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Missing search query (q)" },
        { status: 400 }
      );
    }

    const regex = new RegExp(query, "i"); // case-insensitive

    const normalize = (
      doc: any,
      category: "song" | "album" | "video"
    ) => ({
      id: String(doc._id),
      title: doc.title || doc.name || "Untitled",
      artist: doc.artist || doc.curator || doc.creator || "Unknown Artist",
      genre: doc.genre,
      stats: {
        plays: doc.views,
        views:  doc.views,
        downloads: doc.downloads,
        likes: doc.likes,
      },
      image:
        doc.coverUrl ||
        doc.thumbnailUrl ||
        doc.profilePic ||
        doc.image ||
        "/assets/images/placeholder_cover.jpg",
      type: category,
      href: category === "song" ? `/music/${category}/${String(doc._id)}`:category === "album" ? `/music/${category}/${String(doc._id)}` : `/${category}s/${String(doc._id)}`, // ✅ dynamic link
      releaseDate: doc.releaseDate,
    });

    const results: any[] = [];

    // SONGS
    if (!type || type === "all" || type === "songs") {
      const songs = await Song.find({
        $or: [{ title: regex }, { artist: regex }],
      })
        .limit(limit)
        .lean();
      results.push(...songs.map((s) => normalize(s, "song")));
    }

    // ALBUMS
    if (!type || type === "all" || type === "albums") {
      const albums = await Album.find({
        $or: [{ title: regex }, { artist: regex }],
      })
        .limit(limit)
        .lean();
      results.push(...albums.map((a) => normalize(a, "album")));
    }

    // VIDEOS
    if (!type || type === "all" || type === "videos") {
      const videos = await Video.find({
        $or: [{ title: regex }, { artist: regex }],
      })
        .limit(limit)
        .lean();
      results.push(...videos.map((v) => normalize(v, "video")));
    }

    // Optional: sort by newest first
    results.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    return NextResponse.json({
      success: true,
      query,
      type: type || "all",
      count: results.length,
      results,
    });
  } catch (error: any) {
    console.error("[API /search] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
