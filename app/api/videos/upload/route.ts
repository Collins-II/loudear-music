import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { Video } from "@/lib/database/models/video";
import { getCurrentUser } from "@/actions/getCurrentUser";
import { bufferFromFile } from "@/lib/utils";
import cloudinary from "@/lib/cloudinary";

/* ---------------------- CORS Helper ---------------------- */
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

/* ---------------------- OPTIONS Handler ---------------------- */
export async function OPTIONS() {
  return corsResponse({}, 200);
}

/* ---------------------- POST Handler ---------------------- */
export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return corsResponse({ error: "Unauthorized: Please log in first." }, 401);
    }

    const formData = await req.formData();

    // ✅ Extract & sanitize fields
    const title = formData.get("title")?.toString().trim() || "";
    const artist = formData.get("artist")?.toString().trim() || "";
    const videographer = formData.get("videographer")?.toString().trim() || "";
    const genre = formData.get("genre")?.toString().trim() || "";
    const description = formData.get("description")?.toString().trim() || "";
    const releaseDateStr = formData.get("releaseDate")?.toString();
    const features = (formData.get("features")?.toString() || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const tags = (formData.get("tags")?.toString() || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const label = formData.get("label")?.toString().trim() || "";
    const mood = formData.get("mood")?.toString().trim() || "";
    const copyright = formData.get("copyright")?.toString().trim() || "";
    const visibility =
      (formData.get("visibility")?.toString().trim() as
        | "public"
        | "private"
        | "unlisted") || "private";

    // ✅ Files (Cloudinary URLs)
    const videoUrl = formData.get("video")?.toString();
    const thumbnailUrl = formData.get("thumbnail")?.toString();

    // ✅ Validate required fields
    const missing = [];
    if (!title) missing.push("title");
    if (!artist) missing.push("artist");
    if (!videographer) missing.push("videographer");
    if (!thumbnailUrl) missing.push("thumbnail");
    if (!videoUrl) missing.push("video");

    if (missing.length > 0) {
      return corsResponse(
        { error: `Missing required fields: ${missing.join(", ")}` },
        400
      );
    }

    // ✅ Create video document
    const video = await Video.create({
      author: currentUser._id,
      title,
      artist,
      videographer,
      genre,
      description,
      releaseDate: releaseDateStr ? new Date(releaseDateStr) : undefined,
      features,
      tags,
      label,
      mood,
      copyright,
      visibility,
      videoUrl,
      thumbnailUrl,
    });

    // ✅ Optional: emit socket event (if using real-time updates)
    if (globalThis.io) {
      globalThis.io.emit("media:created", {
        type: "video",
        data: video,
      });
    }

    return corsResponse({ success: true, video }, 201);
  } catch (error: any) {
    console.error("Error saving video:", error);
    return corsResponse(
      { error: "Failed to save video", details: error.message },
      500
    );
  }
}

/* ---------------------- READ (GET) ---------------------- */
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const author = url.searchParams.get("author");

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
    console.error("Video GET Error:", error);
    return corsResponse({ error: "Failed to fetch videos" }, 500);
  }
}

/* ---------------------- UPDATE (PUT) ---------------------- */
export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();
    if (!currentUser) return corsResponse({ error: "Unauthorized" }, 401);

    const formData = await req.formData();
    const id = formData.get("videoId")?.toString();
    if (!id) return corsResponse({ error: "Missing video ID" }, 400);

    const video = await Video.findById(id);
    if (!video) return corsResponse({ error: "Video not found" }, 404);
    if (video.author.toString() !== currentUser._id.toString())
      return corsResponse({ error: "Forbidden" }, 403);

    const updateData: any = {};

    const textFields = ["title", "artist", "videographer", "genre", "description", "label", "copyright", "mood"];
    for (const field of textFields) {
      const val = formData.get(field)?.toString();
      if (val !== undefined) updateData[field] = val;
    }

    const visibility = formData.get("visibility")?.toString() as "public" | "private" | "unlisted";
    if (visibility) updateData.visibility = visibility;

    const parseArray = (key: string) =>
      (formData.get(key)?.toString() || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

    const tags = parseArray("tags");
    const features = parseArray("features");
    if (tags.length) updateData.tags = tags;
    if (features.length) updateData.features = features;

    const releaseDateStr = formData.get("releaseDate")?.toString();
    if (releaseDateStr) updateData.releaseDate = new Date(releaseDateStr);

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

    const updatedVideo = await Video.findByIdAndUpdate(id, updateData, { new: true });

    globalThis.io?.emit("media:update", { type: "video", data: updatedVideo });
    return corsResponse(updatedVideo);
  } catch (error) {
    console.error("Video PUT Error:", error);
    return corsResponse({ error: "Failed to update video", details: (error as any).message }, 500);
  }
}

/* ---------------------- DELETE (DELETE) ---------------------- */
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

    // Clean up Cloudinary
    const deleteAsset = async (url: string, folder: string, type: "image" | "video") => {
      if (!url) return;
      const publicId = url.split("/").pop()?.split(".")[0];
      if (!publicId) return;
      try {
        await cloudinary.uploader.destroy(`${folder}/${publicId}`, { resource_type: type });
      } catch (err) {
        console.log("DELETE_ERR",err)
        console.warn(`Failed to delete Cloudinary asset: ${folder}/${publicId}`);
      }
    };

    await deleteAsset(video.thumbnailUrl, "videos/thumbnails", "image");
    await deleteAsset(video.videoUrl, "videos/files", "video");

    await Video.findByIdAndDelete(id);
    globalThis.io?.emit("media:delete", { type: "video", id });

    return corsResponse({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Video DELETE Error:", error);
    return corsResponse({ error: "Failed to delete video", details: (error as any).message }, 500);
  }
}
