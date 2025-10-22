import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { Album } from "@/lib/database/models/album";
import { Song } from "@/lib/database/models/song";
import cloudinary from "@/lib/cloudinary";
import { getCurrentUser } from "@/actions/getCurrentUser";

// =====================================================
// Utility Helpers
// =====================================================
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

async function bufferFromFile(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadToCloudinary(buffer: Buffer, options: Record<string, any>): Promise<any> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(options, (err, result) =>
      err ? reject(err) : resolve(result)
    ).end(buffer);
  });
}

// =====================================================
// OPTIONS: CORS preflight
// =====================================================
export async function OPTIONS() {
  return corsResponse({}, 200);
}

// =====================================================
// GET: Fetch albums (optional filters)
// =====================================================
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user");
    const visibility = searchParams.get("visibility");

    const filter: any = {};
    if (userId) filter.author = userId;
    if (visibility) filter.visibility = visibility;

    const albums = await Album.find(filter)
      .populate("songs")
      .sort({ createdAt: -1 });

    return corsResponse({ success: true, count: albums.length, albums });
  } catch (error: any) {
    console.error("Error fetching albums:", error);
    return corsResponse({ error: "Failed to fetch albums", details: error.message }, 500);
  }
}

// =====================================================
// POST: Create album and upload songs
// =====================================================
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();
    if (!currentUser) return corsResponse({ error: "Unauthorized" }, 401);

    const formData = await req.formData();

    const title = formData.get("title")?.toString() || "";
    const artist = formData.get("artist")?.toString() || "";
    const genre = formData.get("genre")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const releaseDateStr = formData.get("releaseDate")?.toString() || "";
    const visibility = formData.get("visibility")?.toString() || "private";
    const label = formData.get("label")?.toString() || "";
    const mood = formData.get("mood")?.toString() || "";
    const copyright = formData.get("copyright")?.toString() || "";

    const cover = formData.get("cover") as File | null;
    if (!title || !artist || !cover)
      return corsResponse({ error: "Missing required fields: title, artist, or cover" }, 400);

    // Upload cover
    const uploadedCover = await uploadToCloudinary(await bufferFromFile(cover), {
      folder: "albums",
      resource_type: "image",
    });

    // Parse array fields
    const tags = formData.get("tags") ? JSON.parse(formData.get("tags") as string) : [];
    const producers = formData.get("producers") ? JSON.parse(formData.get("producers") as string) : [];
    const collaborators = formData.get("collaborators") ? JSON.parse(formData.get("collaborators") as string) : [];

    // Upload songs dynamically
    const songDocs: any[] = [];
    let index = 0;
    while (formData.get(`songs[${index}][file]`)) {
      const songFile = formData.get(`songs[${index}][file]`) as File;
      const songTitle = formData.get(`songs[${index}][title]`)?.toString() || `Track ${index + 1}`;
      const songArtist = formData.get(`songs[${index}][artist]`)?.toString() || artist;

      const uploadedSong = await uploadToCloudinary(await bufferFromFile(songFile), {
        folder: "songs",
        resource_type: "video",
      });

      const songDoc = await Song.create({
        author: currentUser._id,
        title: songTitle,
        artist: songArtist,
        album: title,
        fileUrl: uploadedSong.secure_url,
        coverUrl: uploadedCover.secure_url,
        visibility,
      });

      songDocs.push(songDoc._id);
      index++;
    }

    // Create album
    const album = await Album.create({
      author: currentUser._id,
      title,
      artist,
      genre,
      description,
      label,
      mood,
      copyright,
      tags,
      producers,
      collaborators,
      releaseDate: releaseDateStr ? new Date(releaseDateStr) : undefined,
      visibility,
      songs: songDocs,
      coverUrl: uploadedCover.secure_url,
      totalSongs: songDocs.length,
    });

    globalThis.io?.emit("media:create", { type: "album", data: album });
    return corsResponse({ success: true, album }, 201);
  } catch (error: any) {
    console.error("Error uploading album:", error);
    return corsResponse({ error: "Failed to upload album", details: error.message }, 500);
  }
}

// =====================================================
// PUT: Update album metadata or cover
// =====================================================
export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();
    if (!currentUser) return corsResponse({ error: "Unauthorized" }, 401);

    const formData = await req.formData();
    const id = formData.get("itemId")?.toString();
    if (!id) return corsResponse({ error: "Missing album ID" }, 400);

    const album = await Album.findById(id);
    if (!album) return corsResponse({ error: "Album not found" }, 404);
    if (album.author.toString() !== currentUser._id.toString()) return corsResponse({ error: "Forbidden" }, 403);

    const updates: any = {};
    const fields = ["title", "artist", "genre", "description", "visibility", "label", "mood", "copyright"];
    for (const field of fields) {
      const val = formData.get(field)?.toString();
      if (val !== undefined) updates[field] = val;
    }

    const releaseDateStr = formData.get("releaseDate")?.toString();
    if (releaseDateStr) updates.releaseDate = new Date(releaseDateStr);

    const coverFile = formData.get("cover") as File | null;
    if (coverFile && coverFile.size > 0) {
      const uploadedCover = await uploadToCloudinary(await bufferFromFile(coverFile), {
        folder: "albums",
        resource_type: "image",
      });
      updates.coverUrl = uploadedCover.secure_url;
    }

    Object.assign(album, updates);
    await album.save();

    globalThis.io?.emit("media:update", { type: "album", data: album });
    return corsResponse({ success: true, album });
  } catch (error: any) {
    console.error("Error updating album:", error);
    return corsResponse({ error: "Failed to update album", details: error.message }, 500);
  }
}

// =====================================================
// DELETE: Remove album and its songs
// =====================================================
export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();
    if (!currentUser) return corsResponse({ error: "Unauthorized" }, 401);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return corsResponse({ error: "Missing album ID" }, 400);

    const album = await Album.findById(id).populate("songs");
    if (!album) return corsResponse({ error: "Album not found" }, 404);
    if (album.author.toString() !== currentUser._id.toString()) return corsResponse({ error: "Forbidden" }, 403);

    // Delete songs
    for (const song of album.songs as any[]) {
      await Song.findByIdAndDelete(song._id);
    }

    await Album.findByIdAndDelete(id);
    globalThis.io?.emit("media:delete", { type: "album", id });

    return corsResponse({ success: true, message: "Album and songs deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting album:", error);
    return corsResponse({ error: "Failed to delete album", details: error.message }, 500);
  }
}
