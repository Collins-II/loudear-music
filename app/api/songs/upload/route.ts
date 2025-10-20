import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { Song } from "@/lib/database/models/song";
import cloudinary from "@/lib/cloudinary";
import { getCurrentUser } from "@/actions/getCurrentUser";

/* ---------------------- CORS + Helpers ---------------------- */
function corsResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function OPTIONS() {
  return corsResponse({}, 200);
}

async function bufferFromFile(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/* ---------------------- CREATE SONG ---------------------- */
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();
    if (!currentUser) return corsResponse({ error: "Unauthorized" }, 401);

    const formData = await req.formData();

    const title = formData.get("title")?.toString() || "";
    const artist = formData.get("artist")?.toString() || "";
    const album = formData.get("album")?.toString() || "";
    const genre = formData.get("genre")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const language = formData.get("language")?.toString() || "";
    const releaseDateStr = formData.get("releaseDate")?.toString();
    const explicit = formData.get("explicit") === "true";
    const features = (formData.get("features")?.toString() || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const tags = (formData.get("tags")?.toString() || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const songFile = formData.get("song") as File;
    const coverFile = formData.get("cover") as File;
    if (!songFile || !coverFile)
      return corsResponse({ error: "Missing song or cover file" }, 400);

    const coverBuffer = await bufferFromFile(coverFile);
    const coverResult = (await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "songs/covers", resource_type: "image" },
        (err, result) => (err ? reject(err) : resolve(result))
      ).end(coverBuffer);
    })) as any;

    const songBuffer = await bufferFromFile(songFile);
    const songResult = (await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "songs/files", resource_type: "video" },
        (err, result) => (err ? reject(err) : resolve(result))
      ).end(songBuffer);
    })) as any;

    const song = await Song.create({
      author: currentUser._id,
      title,
      artist,
      album,
      genre,
      description,
      language,
      releaseDate: releaseDateStr ? new Date(releaseDateStr) : undefined,
      explicit,
      features,
      tags,
      fileUrl: songResult.secure_url,
      coverUrl: coverResult.secure_url,
    });

    return corsResponse(song, 201);
  } catch (error) {
    console.error("POST Error:", error);
    return corsResponse(
      { error: "Failed to save song", details: (error as any).message },
      500
    );
  }
}

/* ---------------------- READ SONG(S) ---------------------- */
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const author = searchParams.get("author");

    if (id) {
      const song = await Song.findById(id);
      if (!song) return corsResponse({ error: "Song not found" }, 404);
      return corsResponse(song);
    }

    const query: any = {};
    if (author) query.author = author;

    const songs = await Song.find(query).sort({ createdAt: -1 });
    return corsResponse(songs);
  } catch (error) {
    console.error("GET Error:", error);
    return corsResponse({ error: "Failed to fetch songs" }, 500);
  }
}

/* ---------------------- UPDATE SONG ---------------------- */
export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();
    if (!currentUser) return corsResponse({ error: "Unauthorized" }, 401);

    const contentType = req.headers.get("content-type") || "";
    const updateData: any = {};
    let id: string | undefined;

    // -----------------------------
    // 📦 1. Handle JSON Requests
    // -----------------------------
    if (contentType.includes("application/json")) {
      const body = await req.json();
      id = body.itemId || body.id;
      if (!id) return corsResponse({ error: "Missing song ID" }, 400);

      // Extract updatable fields
      [
        "title",
        "artist",
        "album",
        "genre",
        "description",
        "language",
        "explicit",
      ].forEach((key) => {
        if (body[key] !== undefined) updateData[key] = body[key];
      });

      // Handle arrays and strings
      if (body.features)
        updateData.features = Array.isArray(body.features)
          ? body.features
          : body.features.split(",").map((t: string) => t.trim());

      if (body.tags)
        updateData.tags = Array.isArray(body.tags)
          ? body.tags
          : body.tags.split(",").map((t: string) => t.trim());

      if (body.releaseDate)
        updateData.releaseDate = new Date(body.releaseDate);
    }

    // -----------------------------
    // 🎵 2. Handle Multipart FormData
    // -----------------------------
    else if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const formData = await req.formData();
      id = formData.get("itemId")?.toString();
      if (!id) return corsResponse({ error: "Missing song ID" }, 400);

      [
        "title",
        "artist",
        "album",
        "genre",
        "description",
        "language",
        "explicit",
      ].forEach((key) => {
        const val = formData.get(key)?.toString();
        if (val !== undefined) updateData[key] = val;
      });

      const features = (formData.get("features")?.toString() || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const tags = (formData.get("tags")?.toString() || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      if (features.length) updateData.features = features;
      if (tags.length) updateData.tags = tags;

      const releaseDateStr = formData.get("releaseDate")?.toString();
      if (releaseDateStr)
        updateData.releaseDate = new Date(releaseDateStr);

      // 🖼 Optional cover upload
      const coverFile = formData.get("cover") as File;
      if (coverFile && coverFile.size > 0) {
        const coverBuffer = await bufferFromFile(coverFile);
        const coverResult = (await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: "songs/covers", resource_type: "image" },
            (err, result) => (err ? reject(err) : resolve(result))
          ).end(coverBuffer);
        })) as any;
        updateData.coverUrl = coverResult.secure_url;
      }

      // 🎧 Optional song file upload
      const songFile = formData.get("song") as File;
      if (songFile && songFile.size > 0) {
        const songBuffer = await bufferFromFile(songFile);
        const songResult = (await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: "songs/files", resource_type: "video" },
            (err, result) => (err ? reject(err) : resolve(result))
          ).end(songBuffer);
        })) as any;
        updateData.fileUrl = songResult.secure_url;
      }
    } else {
      return corsResponse(
        { error: "Unsupported Content-Type" },
        415 // 415 Unsupported Media Type
      );
    }

    // -----------------------------
    // ✅ 3. Validate & Update
    // -----------------------------
    const song = await Song.findById(id);
    if (!song) return corsResponse({ error: "Song not found" }, 404);
    if (song.author.toString() !== currentUser._id.toString())
      return corsResponse({ error: "Forbidden" }, 403);

    const updatedSong = await Song.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return corsResponse({ success: true, song: updatedSong });
  } catch (error: any) {
    console.error("PUT Error:", error);
    return corsResponse({ error: "Failed to update song", details: error.message }, 500);
  }
}

/* ---------------------- DELETE SONG ---------------------- */
export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();
    if (!currentUser) return corsResponse({ error: "Unauthorized" }, 401);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return corsResponse({ error: "Missing song ID" }, 400);

    const song = await Song.findById(id);
    if (!song) return corsResponse({ error: "Song not found" }, 404);
    if (song.author.toString() !== currentUser._id.toString())
      return corsResponse({ error: "Forbidden" }, 403);

    await Song.findByIdAndDelete(id);

    return corsResponse({ message: "Song deleted successfully" });
  } catch (error) {
    console.error("DELETE Error:", error);
    return corsResponse({ error: "Failed to delete song" }, 500);
  }
}
