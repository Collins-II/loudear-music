import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { Song } from "@/lib/database/models/song";
import cloudinary from "@/lib/cloudinary";
import { getCurrentUser } from "@/actions/getCurrentUser";

// ------------------------------
// 🧩 Utilities
// ------------------------------
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

export async function OPTIONS() {
  return corsResponse({}, 200);
}

// ------------------------------
// 🟢 CREATE (POST)
// ------------------------------
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();
    if (!currentUser) return corsResponse({ error: "Unauthorized" }, 401);

    const formData = await req.formData();

    // Fields
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

    // Files
    const songFile = formData.get("song") as File;
    const coverFile = formData.get("cover") as File;

    if (!songFile || !coverFile) return corsResponse({ error: "Missing song or cover file" }, 400);

    // Upload cover
    const coverBuffer = await bufferFromFile(coverFile);
    const coverUpload = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "songs/covers", resource_type: "image" },
        (err, result) => (err ? reject(err) : resolve(result))
      ).end(coverBuffer);
    });
    const uploadedCover = coverUpload as any;

    // Upload song file
    const songBuffer = await bufferFromFile(songFile);
    const songUpload = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "songs/files", resource_type: "video" }, // audio = video type
        (err, result) => (err ? reject(err) : resolve(result))
      ).end(songBuffer);
    });
    const uploadedSong = songUpload as any;

    // Save song
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
      fileUrl: uploadedSong.secure_url,
      coverUrl: uploadedCover.secure_url,
      duration: uploadedSong.duration,
    });

    return corsResponse({ success: true, song }, 201);
  } catch (error) {
    console.error("Song POST Error:", error);
    return corsResponse({ error: "Failed to upload song", details: (error as any).message }, 500);
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
    const artist = url.searchParams.get("artist");

    if (id) {
      const song = await Song.findById(id);
      if (!song) return corsResponse({ error: "Song not found" }, 404);
      return corsResponse({ song });
    }

    const query: any = {};
    if (artist) query.artist = artist;

    const songs = await Song.find(query).sort({ createdAt: -1 });
    return corsResponse({ songs });
  } catch (error) {
    console.error("Song GET Error:", error);
    return corsResponse({ error: "Failed to fetch songs" }, 500);
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
    const songId = formData.get("songId")?.toString();
    if (!songId) return corsResponse({ error: "Missing songId" }, 400);

    const existingSong = await Song.findById(songId);
    if (!existingSong) return corsResponse({ error: "Song not found" }, 404);

    // Update fields
    existingSong.title = formData.get("title")?.toString() || existingSong.title;
    existingSong.artist = formData.get("artist")?.toString() || existingSong.artist;
    existingSong.album = formData.get("album")?.toString() || existingSong.album;
    existingSong.genre = formData.get("genre")?.toString() || existingSong.genre;
    existingSong.description = formData.get("description")?.toString() || existingSong.description;
    existingSong.language = formData.get("language")?.toString() || existingSong.language;
    existingSong.explicit = formData.get("explicit") === "true" || existingSong.explicit;
    existingSong.tags =
      (formData.get("tags")?.toString() || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean) || existingSong.tags;

    // Optional cover update
    const newCover = formData.get("cover") as File | null;
    if (newCover) {
      const buffer = await bufferFromFile(newCover);
      const upload = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "songs/covers", resource_type: "image" },
          (err, result) => (err ? reject(err) : resolve(result))
        ).end(buffer);
      });
      const uploaded = upload as any;
      existingSong.coverUrl = uploaded.secure_url;
    }

    // Optional song file update
    const newSongFile = formData.get("song") as File | null;
    if (newSongFile) {
      const buffer = await bufferFromFile(newSongFile);
      const upload = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "songs/files", resource_type: "video" },
          (err, result) => (err ? reject(err) : resolve(result))
        ).end(buffer);
      });
      const uploaded = upload as any;
      existingSong.fileUrl = uploaded.secure_url;
      existingSong.duration = uploaded.duration;
    }

    await existingSong.save();
    return corsResponse({ success: true, song: existingSong });
  } catch (error) {
    console.error("Song PUT Error:", error);
    return corsResponse({ error: "Failed to update song" }, 500);
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
    if (!id) return corsResponse({ error: "Missing song id" }, 400);

    const song = await Song.findById(id);
    if (!song) return corsResponse({ error: "Song not found" }, 404);

    // Try deleting Cloudinary assets
    if (song.coverUrl) {
      const publicId = song.coverUrl.split("/").pop()?.split(".")[0];
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(`songs/covers/${publicId}`, { resource_type: "image" });
        } catch {
          console.warn("Failed to delete song cover");
        }
      }
    }

    if (song.fileUrl) {
      const publicId = song.fileUrl.split("/").pop()?.split(".")[0];
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(`songs/files/${publicId}`, { resource_type: "video" });
        } catch {
          console.warn("Failed to delete song file");
        }
      }
    }

    await Song.findByIdAndDelete(id);
    return corsResponse({ success: true, message: "Song deleted successfully" });
  } catch (error) {
    console.error("Song DELETE Error:", error);
    return corsResponse({ error: "Failed to delete song" }, 500);
  }
}
