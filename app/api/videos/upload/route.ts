import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { Video } from "@/lib/database/models/video";
import { getCurrentUser } from "@/actions/getCurrentUser";
import cloudinary from "@/lib/cloudinary";

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

/* ---------------------- CREATE VIDEO ---------------------- */
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();
    if (!currentUser) return corsResponse({ error: "Unauthorized" }, 401);

    const formData = await req.formData();

    const title = formData.get("title")?.toString() || "";
    const artist = formData.get("artist")?.toString() || "";
    const videographer = formData.get("videographer")?.toString() || "";
    const genre = formData.get("genre")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const releaseDateStr = formData.get("releaseDate")?.toString() || "";
    const features = (formData.get("features")?.toString() || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const tags = (formData.get("tags")?.toString() || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const videoFile = formData.get("video") as File;
    const thumbnailFile = formData.get("thumbnail") as File;

    if (!videoFile || !thumbnailFile || !title || !artist || !videographer) {
      return corsResponse(
        { error: "Missing required fields or files" },
        400
      );
    }

    // Upload thumbnail to Cloudinary
    const thumbBuffer = await bufferFromFile(thumbnailFile);
    const thumbResult = (await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "videos/thumbnails", resource_type: "image" },
        (err, result) => (err ? reject(err) : resolve(result))
      ).end(thumbBuffer);
    })) as any;

    // Upload video file to Cloudinary
    const videoBuffer = await bufferFromFile(videoFile);
    const videoResult = (await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "videos/files", resource_type: "video" },
        (err, result) => (err ? reject(err) : resolve(result))
      ).end(videoBuffer);
    })) as any;

    const video = await Video.create({
      author: currentUser._id,
      title,
      artist,
      videographer,
      genre,
      description,
      features,
      tags,
      releaseDate: releaseDateStr ? new Date(releaseDateStr) : undefined,
      videoUrl: videoResult.secure_url,
      thumbnailUrl: thumbResult.secure_url,
    });

    return corsResponse(video, 201);
  } catch (error) {
    console.error("POST Error:", error);
    return corsResponse(
      { error: "Failed to upload video", details: (error as any).message },
      500
    );
  }
}

/* ---------------------- READ VIDEO(S) ---------------------- */
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const author = searchParams.get("author");

    if (id) {
      const video = await Video.findById(id);
      if (!video) return corsResponse({ error: "Video not found" }, 404);
      return corsResponse(video);
    }

    const query: any = {};
    if (author) query.author = author;

    const videos = await Video.find(query).sort({ createdAt: -1 });
    return corsResponse(videos);
  } catch (error) {
    console.error("GET Error:", error);
    return corsResponse({ error: "Failed to fetch videos" }, 500);
  }
}

/* ---------------------- UPDATE VIDEO ---------------------- */
export const runtime = "nodejs"; // allows using formData + buffers

export async function PUT(req: Request) {
  try {
    await connectToDatabase();

    const currentUser = await getCurrentUser();
    if (!currentUser) return corsResponse({ error: "Unauthorized" }, 401);

    const formData = await req.formData();
    const id = formData.get("itemId")?.toString();
    if (!id) return corsResponse({ error: "Missing video ID" }, 400);

    const video = await Video.findById(id);
    if (!video) return corsResponse({ error: "Video not found" }, 404);
    if (video.author.toString() !== currentUser._id.toString())
      return corsResponse({ error: "Forbidden" }, 403);

    const updateData: any = {};

    // 🔹 Text fields
    const textFields = ["title", "artist", "videographer", "genre", "description"];
    for (const field of textFields) {
      const val = formData.get(field)?.toString();
      if (val !== undefined) updateData[field] = val;
    }

    // 🔹 Arrays (tags, features)
    const parseArray = (key: string) =>
      (formData.get(key)?.toString() || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

    const tags = parseArray("tags");
    const features = parseArray("features");

    if (tags.length) updateData.tags = tags;
    if (features.length) updateData.features = features;

    // 🔹 Optional release date
    const releaseDateStr = formData.get("releaseDate")?.toString();
    if (releaseDateStr) updateData.releaseDate = new Date(releaseDateStr);

    // 🔹 Upload thumbnail
    const thumbnailFile = formData.get("thumbnail") as File | null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      const thumbBuffer = await bufferFromFile(thumbnailFile);
      const thumbResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "videos/thumbnails", resource_type: "image" },
          (err, result) => (err ? reject(err) : resolve(result))
        ).end(thumbBuffer);
      });
      updateData.thumbnailUrl = thumbResult.secure_url;
    }

    // 🔹 Upload video
    const videoFile = formData.get("video") as File | null;
    if (videoFile && videoFile.size > 0) {
      const videoBuffer = await bufferFromFile(videoFile);
      const videoResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "videos/files", resource_type: "video" },
          (err, result) => (err ? reject(err) : resolve(result))
        ).end(videoBuffer);
      });
      updateData.videoUrl = videoResult.secure_url;
    }

    const updatedVideo = await Video.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return corsResponse(updatedVideo);
  } catch (error) {
    console.error("PUT Error:", error);
    return corsResponse({ error: "Failed to update video" }, 500);
  }
}

/* ---------------------- DELETE VIDEO ---------------------- */
export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();
    if (!currentUser) return corsResponse({ error: "Unauthorized" }, 401);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return corsResponse({ error: "Missing video ID" }, 400);

    const video = await Video.findById(id);
    if (!video) return corsResponse({ error: "Video not found" }, 404);
    if (video.author.toString() !== currentUser._id.toString())
      return corsResponse({ error: "Forbidden" }, 403);

    await Video.findByIdAndDelete(id);

    return corsResponse({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("DELETE Error:", error);
    return corsResponse({ error: "Failed to delete video" }, 500);
  }
}
