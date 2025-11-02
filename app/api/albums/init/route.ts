import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { Album } from "@/lib/database/models/album";
import { getCurrentUser } from "@/actions/getCurrentUser";

function corsResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function OPTIONS() {
  return corsResponse({}, 200);
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();
    if (!currentUser) return corsResponse({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const {
      title,
      artist,
      genre,
      releaseDate,
      description,
      tags,
      producers,
      collaborators,
      mood,
      label,
      copyright,
      visibility,
    } = body;

    if (!title || !artist)
      return corsResponse({ error: "Missing title or artist" }, 400);

    const album = await Album.create({
      author: currentUser._id,
      title,
      artist,
      genre,
      releaseDate,
      description,
      tags: tags?.split(",").map((t: string) => t.trim()) || [],
      producers,
      collaborators,
      mood,
      label,
      copyright,
      visibility,
      songs: [],
      coverUrl: "",
    });

    globalThis.io?.emit("album:init", { albumId: album._id, title });

    return corsResponse({ albumId: album._id });
  } catch (err: any) {
    console.error("INIT Album error:", err);
    return corsResponse({ error: "Failed to create album" }, 500);
  }
}
