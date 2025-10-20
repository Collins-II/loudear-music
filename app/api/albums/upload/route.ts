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
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
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

export async function OPTIONS() {
  return corsResponse({}, 200);
}

// =====================================================
// GET: List all albums (optionally filter by user or visibility)
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
// POST: Create album with songs
// =====================================================
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();
    if (!currentUser) return corsResponse({ error: "Unauthorized" }, 401);

    const formData = await req.formData();
    const title = formData.get("albumTitle")?.toString() || "";
    const artist = formData.get("artist")?.toString() || "";
    const genre = formData.get("genre")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const releaseDateStr = formData.get("releaseDate")?.toString() || "";
    const visibility = formData.get("visibility")?.toString() || "private";

    const cover = formData.get("cover") as File | null;
    if (!title || !artist || !cover)
      return corsResponse({ error: "Missing required fields: title, artist, or cover" }, 400);

    const coverBuffer = await bufferFromFile(cover);
    const uploadedCover = await uploadToCloudinary(coverBuffer, {
      folder: "albums",
      resource_type: "image",
    });

    // Upload songs
    const songDocs: any[] = [];
    let index = 0;
    while (formData.get(`songs[${index}][file]`)) {
      const file = formData.get(`songs[${index}][file]`) as File;
      const songTitle = formData.get(`songs[${index}][title]`)?.toString() || `Track ${index + 1}`;

      const songBuffer = await bufferFromFile(file);
      const uploadedSong = await uploadToCloudinary(songBuffer, {
        folder: "songs",
        resource_type: "video",
      });

      const songDoc = await Song.create({
        author: currentUser._id,
        title: songTitle,
        album: title,
        fileUrl: uploadedSong.secure_url,
        coverUrl: uploadedCover.secure_url,
        visibility,
      });

      songDocs.push(songDoc._id);
      index++;
    }

    const album = await Album.create({
      author: currentUser._id,
      title,
      artist,
      genre,
      description,
      releaseDate: releaseDateStr ? new Date(releaseDateStr) : undefined,
      visibility,
      songs: songDocs,
      coverUrl: uploadedCover.secure_url,
      totalSongs: songDocs.length,
    });

    return corsResponse({ success: true, album }, 201);
  } catch (error: any) {
    console.error("Error uploading album:", error);
    return corsResponse({ error: "Failed to upload album", details: error.message }, 500);
  }
}

// =====================================================
// PATCH: Update album metadata
// =====================================================
export const runtime = "nodejs"; // Hybrid-ready

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
    if (album.author.toString() !== currentUser._id.toString())
      return corsResponse({ error: "Forbidden" }, 403);

    const updates: any = {};
    const fields = ["title", "artist", "genre", "description", "visibility"];
    for (const field of fields) {
      const val = formData.get(field)?.toString();
      if (val !== undefined) updates[field] = val;
    }

    const releaseDateStr = formData.get("releaseDate")?.toString();
    if (releaseDateStr) updates.releaseDate = new Date(releaseDateStr);

    // 🔹 Optional cover upload
    const coverFile = formData.get("cover") as File | null;
    if (coverFile && coverFile.size > 0) {
      const coverBuffer = await bufferFromFile(coverFile);
      const uploadedCover = await uploadToCloudinary(coverBuffer, {
        folder: "albums",
        resource_type: "image",
      });
      updates.coverUrl = uploadedCover.secure_url;
    }

    Object.assign(album, updates);
    await album.save();

    return corsResponse({ success: true, album });
  } catch (error: any) {
    console.error("Error updating album:", error);
    return corsResponse(
      { error: "Failed to update album", details: error.message },
      500
    );
  }
}


// =====================================================
// DELETE: Remove album (and optionally songs)
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
    if (album.author.toString() !== currentUser._id.toString())
      return corsResponse({ error: "Forbidden" }, 403);

    // Optionally delete all songs from Cloudinary and DB
    for (const song of album.songs as any[]) {
      // Cloudinary delete (optional, requires public_id)
      // await cloudinary.uploader.destroy(song.public_id, { resource_type: "video" });
      await Song.findByIdAndDelete(song._id);
    }

    await Album.findByIdAndDelete(id);

    return corsResponse({ success: true, message: "Album and songs deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting album:", error);
    return corsResponse({ error: "Failed to delete album", details: error.message }, 500);
  }
}
