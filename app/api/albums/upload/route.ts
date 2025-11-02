// app/api/albums/upload/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { Album } from "@/lib/database/models/album";
import { Song } from "@/lib/database/models/song";
import cloudinary from "@/lib/cloudinary";
import { getCurrentUser } from "@/actions/getCurrentUser";

// Helper: Convert File → Buffer
async function bufferFromFile(file: File): Promise<Buffer> {
  const arr = await file.arrayBuffer();
  return Buffer.from(arr);
}

// Helper: JSON + CORS
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

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const io = (globalThis as any).io;

    const currentUser = await getCurrentUser();
    if (!currentUser) return corsResponse({ error: "Unauthorized" }, 401);

    const formData = await req.formData();

    // ─── Basic Fields ─────────────────────────────
    const title = formData.get("title")?.toString();
    const artist = formData.get("artist")?.toString();
    const genre = formData.get("genre")?.toString();
    const releaseDate = formData.get("releaseDate")?.toString();
    const description = formData.get("description")?.toString();
    const tags = (formData.get("tags")?.toString() || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const producers = (formData.get("producers")?.toString() || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const collaborators = (formData.get("collaborators")?.toString() || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const mood = formData.get("mood")?.toString() || "";
    const label = formData.get("label")?.toString() || "";
    const copyright = formData.get("copyright")?.toString() || "";
    const visibility = (formData.get("visibility")?.toString() ||
      "private") as "public" | "private" | "unlisted";

    const cover = formData.get("cover") as File | null;
    if (!title || !artist || !cover) {
      return corsResponse({ error: "Missing required fields" }, 400);
    }

    // ─── Upload Album Cover ───────────────────────
    const coverBuffer = await bufferFromFile(cover);
    const uploadedCover: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "albums/covers", resource_type: "image" },
          (err, result) => (err ? reject(err) : resolve(result))
        )
        .end(coverBuffer);
    });

    // ─── Upload Songs ─────────────────────────────
    let idx = 0;
    const songIds: string[] = [];
    let totalDuration = 0;

    while (formData.get(`songs[${idx}][file]`)) {
      const file = formData.get(`songs[${idx}][file]`) as File;
      const songTitle = formData.get(`songs[${idx}][title]`)?.toString() || "";
      const songArtist = formData.get(`songs[${idx}][artist]`)?.toString() || "";
      const songGenre = formData.get(`songs[${idx}][genre]`)?.toString() || "";
      const explicit =
        (formData.get(`songs[${idx}][explicit]`)?.toString() || "") === "true";
      const songTags = (formData.get(`songs[${idx}][tags]`)?.toString() || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const songBuffer = await bufferFromFile(file);

      // 🔵 Emit starting progress to client
      io?.emit("uploadProgress", { fileName: songTitle, progress: 0 });

      const uploadResult: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: "songs",
            chunk_size: 6_000_000, // ~6MB per chunk
            eager_async: true,
          },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.write(songBuffer);
        stream.end();
      });

      totalDuration += uploadResult.duration || 0;

      const newSong = await Song.create({
        author: currentUser._id,
        title: songTitle || file.name,
        artist: songArtist || artist,
        genre: songGenre || genre,
        album: title,
        explicit,
        tags: songTags,
        fileUrl: uploadResult.secure_url,
        coverUrl: uploadedCover.secure_url,
        duration: uploadResult.duration,
      });

      songIds.push(newSong._id.toString());

      // 🔵 Emit completion
      io?.emit("uploadProgress", { fileName: songTitle, progress: 100 });
      idx++;
    }

    // ─── Save Album ───────────────────────────────
    const album = await Album.create({
      author: currentUser._id,
      title,
      artist,
      genre,
      releaseDate: releaseDate ? new Date(releaseDate) : undefined,
      description,
      tags,
      producers,
      collaborators,
      mood,
      label,
      copyright,
      visibility,
      totalSongs: songIds.length,
      duration: totalDuration,
      songs: songIds,
      coverUrl: uploadedCover.secure_url,
    });

    io?.emit("uploadComplete", { albumId: album._id, title });

    return corsResponse({ success: true, album }, 201);
  } catch (error: any) {
    console.error("Album upload error:", error);
    return corsResponse({ error: error.message || "Failed to upload album" }, 500);
  }
}
// ------------------------------
// 🔵 READ (GET)
// ------------------------------
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const album = await Album.findById(id).populate("songs");
      if (!album) return corsResponse({ error: "Album not found" }, 404);
      return corsResponse({ album });
    }

    const albums = await Album.find().populate("songs").sort({ createdAt: -1 });
    return corsResponse({ albums });
  } catch (error) {
    console.error("Album GET Error:", error);
    return corsResponse({ error: "Failed to fetch albums" }, 500);
  }
}

// ------------------------------
// 🟠 UPDATE (PUT)
// ------------------------------
export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();
    if (!currentUser) return corsResponse({ error: "Unauthorized" }, 401);

    const formData = await req.formData();
    const albumId = formData.get("albumId") as string;
    if (!albumId) return corsResponse({ error: "Missing albumId" }, 400);

    const existingAlbum = await Album.findById(albumId);
    if (!existingAlbum) return corsResponse({ error: "Album not found" }, 404);

    // Update basic fields
    existingAlbum.title = formData.get("title")?.toString() || existingAlbum.title;
    existingAlbum.artist = formData.get("artist")?.toString() || existingAlbum.artist;
    existingAlbum.genre = formData.get("genre")?.toString() || existingAlbum.genre;
    existingAlbum.description = formData.get("description")?.toString() || existingAlbum.description;
    existingAlbum.tags = (formData.get("tags") as string)?.split(",").map((t) => t.trim()) || existingAlbum.tags;

    // Optional cover update
    const cover = formData.get("cover") as File | null;
    if (cover) {
      const buffer = await bufferFromFile(cover);
      const uploadRes = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "albums/covers", resource_type: "image" },
          (err, result) => (err ? reject(err) : resolve(result))
        ).end(buffer);
      });
      const uploadedCover = uploadRes as any;
      existingAlbum.coverUrl = uploadedCover.secure_url;
    }

    await existingAlbum.save();
    return corsResponse({ success: true, album: existingAlbum });
  } catch (error) {
    console.error("Album PUT Error:", error);
    return corsResponse({ error: "Failed to update album" }, 500);
  }
}

// ------------------------------
// 🔴 DELETE (DELETE)
// ------------------------------
export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();
    if (!currentUser) return corsResponse({ error: "Unauthorized" }, 401);

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return corsResponse({ error: "Missing album id" }, 400);

    const album = await Album.findById(id).populate("songs");
    if (!album) return corsResponse({ error: "Album not found" }, 404);

    // Delete all associated songs
    for (const song of album.songs) {
      try {
        await cloudinary.uploader.destroy(song.public_id, { resource_type: "video" });
      } catch {
        console.warn("Failed to delete song from Cloudinary:", song._id);
      }
      await Song.findByIdAndDelete(song._id);
    }

    // Delete album cover from Cloudinary
    if (album.coverUrl) {
      const publicId = album.coverUrl.split("/").pop()?.split(".")[0];
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(`albums/covers/${publicId}`, { resource_type: "image" });
        } catch {
          console.warn("Failed to delete album cover from Cloudinary");
        }
      }
    }

    await Album.findByIdAndDelete(id);
    return corsResponse({ success: true, message: "Album deleted successfully" });
  } catch (error) {
    console.error("Album DELETE Error:", error);
    return corsResponse({ error: "Failed to delete album" }, 500);
  }
}
