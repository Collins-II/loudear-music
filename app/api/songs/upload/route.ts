import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { Song } from "@/lib/database/models/song";
import cloudinary from "@/lib/cloudinary";
import { getCurrentUser } from "@/actions/getCurrentUser";

// Utility to add CORS headers
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

// Convert File to Buffer
async function bufferFromFile(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function OPTIONS() {
  return corsResponse({}, 200);
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();

    const formData = await req.formData();

    // Extract fields
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

    if (!songFile || !coverFile) {
      return corsResponse({ error: "Missing song or cover file" }, 400);
    }

    // Upload cover to Cloudinary
    const coverBuffer = await bufferFromFile(coverFile);
    const coverResult = (await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "songs/covers", resource_type: "image" },
        (err, result) => (err ? reject(err) : resolve(result))
      ).end(coverBuffer);
    })) as any;

    // Upload song to Cloudinary
    const songBuffer = await bufferFromFile(songFile);
    const songResult = (await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "songs/files", resource_type: "video" }, // Cloudinary treats audio as "video"
        (err, result) => (err ? reject(err) : resolve(result))
      ).end(songBuffer);
    })) as any;

    // Save in DB
    const song = await Song.create({
      author: currentUser?._id,
      title,
      artist,
      features,
      album,
      description,
      genre,
      language,
      releaseDate: releaseDateStr ? new Date(releaseDateStr) : undefined,
      explicit,
      tags,
      fileUrl: songResult.secure_url,
      coverUrl: coverResult.secure_url,
    });

    return corsResponse(song, 201);
  } catch (error) {
    console.error("Error saving song:", error);
    return corsResponse({ error: "Failed to save song", details: (error as any).message }, 500);
  }
}
