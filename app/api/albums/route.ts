import { connectToDatabase } from "@/lib/database";
import Album, { IAlbum } from "@/lib/database/models/album";
import { ISong } from "@/lib/database/models/song";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

interface AlbumResponse {
  albums: {
    id: string;
    title: string;
    artist: string;
    coverUrl: string;
    publicId: string;
    songs: {
      id: string;
      title: string;
      url: string;
      publicId: string;
    }[];
    createdAt: string;
  }[];
  totalPages: number;
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    // ✅ Extract search params from the request URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "6", 10);

    const totalAlbums = await Album.countDocuments();
    const totalPages = Math.ceil(totalAlbums / limit);

    // ✅ Fetch albums with populated songs
    const albums = await Album.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      //.populate<{ songs: ISong[] }>("songs")
      .lean<IAlbum[]>(); // ensures TS knows this is plain objects

    const formattedAlbums: AlbumResponse["albums"] = albums.map((album) => ({
      id: album._id!.toString(),
      title: album.title,
      artist: album.artist,
      coverUrl: album.coverUrl,
      publicId: album.publicId,
      songs: (album.songs || [])
        .filter((song): song is ISong => typeof song !== "string") // ✅ type guard
        .map((song) => ({
          id: song._id!.toString(),
          title: song.title,
          url: song.url,
          publicId: song.publicId,
        })),
      createdAt:
        album.createdAt instanceof Date
          ? album.createdAt.toISOString()
          : new Date(album.createdAt!).toISOString(),
    }));

    return NextResponse.json(
      { albums: formattedAlbums, totalPages },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("[ALBUM_FETCH_ERR]", error);
    return NextResponse.json(
      {
        message: "Error fetching albums",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
