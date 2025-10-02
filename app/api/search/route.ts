// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { Song } from "@/lib/database/models/song";
import { Album } from "@/lib/database/models/album";
import { Video } from "@/lib/database/models/video";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();
    const type = searchParams.get("type"); // songs, albums, videos, artists, or "all"
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query) {
      return NextResponse.json(
        { error: "Missing search query (q)" },
        { status: 400 }
      );
    }

    const regex = new RegExp(query, "i"); // case-insensitive search

    const normalize = (doc: any, category: string) => ({
      id: String(doc._id),
      title: doc.title || doc.name,
      artist: doc.artist || doc.curator || doc.name || "",
      image:
        doc.coverUrl ||
        doc.thumbnailUrl ||
        doc.profilePic ||
        "/assets/images/placeholder_cover.jpg",
      category,
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
        $or: [{ title: regex }, { curator: regex }],
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

    // ARTISTS (from Song.artist, Album.curator, Video.artist)
    if (!type || type === "all" || type === "artists") {
      const [songArtists, albumArtists, videoArtists] = await Promise.all([
        Song.find({ artist: regex }).distinct("artist"),
        Album.find({ curator: regex }).distinct("curator"),
        Video.find({ artist: regex }).distinct("artist"),
      ]);

      const uniqueArtists = Array.from(
        new Set([...songArtists, ...albumArtists, ...videoArtists])
      ).slice(0, limit);

      results.push(
        ...uniqueArtists.map((name) => ({
          id: name,
          title: name,
          artist: name,
          image: "/assets/images/placeholder_artist.jpg",
          category: "artist",
        }))
      );
    }

    return NextResponse.json({
      query,
      type: type || "all",
      count: results.length,
      results,
    });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
