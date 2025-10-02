import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { Album } from "@/lib/database/models/album";
import { Song } from "@/lib/database/models/song";
import cloudinary from "@/lib/cloudinary";
import { getCurrentUser } from "@/actions/getCurrentUser";

// Utility: buffer from file
async function bufferFromFile(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Utility: cors response
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
    const currentUser = await getCurrentUser();
    const formData = await req.formData();

    // Album fields
    const title = formData.get("albumTitle") as string;
    const artist = formData.get("artist") as string;
    const genre = formData.get("genre") as string;
    const releaseDate = formData.get("releaseDate") as string;
    const description = formData.get("description") as string;
    const tags = (formData.get("tags") as string)?.split(",").map((t) => t.trim()) || [];

    const cover = formData.get("cover") as File;
    if (!title || !artist || !cover) {
      return corsResponse({ error: "Missing required fields" }, 400);
    }

    // Upload cover
    const coverBuffer = await bufferFromFile(cover);
    const coverResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "albums", resource_type: "image" },
        (err, result) => (err ? reject(err) : resolve(result))
      ).end(coverBuffer);
    });
    const uploadedCover = coverResult as any;

    // Process songs
    const songDocs: any[] = [];
    let idx = 0;

    while (formData.get(`songs[${idx}][file]`)) {
      const file = formData.get(`songs[${idx}][file]`) as File;
      const songTitle = formData.get(`songs[${idx}][title]`) as string;
      const songArtist = formData.get(`songs[${idx}][artist]`) as string;
      const songGenre = formData.get(`songs[${idx}][genre]`) as string;
      const explicit = formData.get(`songs[${idx}][explicit]`) === "true";
      const songTags = (formData.get(`songs[${idx}][tags]`) as string)
        ?.split(",")
        .map((t) => t.trim()) || [];

      // Upload song file
      const songBuffer = await bufferFromFile(file);
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: "video", folder: "songs" },
          (err, result) => (err ? reject(err) : resolve(result))
        ).end(songBuffer);
      });
      const uploadedSong = uploadResult as any;

      // Save song
      const songDoc = await Song.create({
        author: currentUser?._id,
        title: songTitle,
        artist: songArtist,
        genre: songGenre,
        album: title,
        explicit,
        tags: songTags,
        fileUrl: uploadedSong.secure_url,
        coverUrl: uploadedCover.secure_url,
        duration: uploadedSong.duration,
      });

      songDocs.push(songDoc._id);
      idx++;
    }

    // Save album
    const album = await Album.create({
      author: currentUser?._id,
      title,
      artist,
      genre,
      releaseDate: releaseDate ? new Date(releaseDate) : undefined,
      description,
      tags,
      songs: songDocs,
      coverUrl: uploadedCover.secure_url,
    });

    return corsResponse({ success: true, album }, 201);
  } catch (error) {
    console.error("Error uploading album:", error);
    return corsResponse({ error: "Failed to upload album" }, 500);
  }
}
