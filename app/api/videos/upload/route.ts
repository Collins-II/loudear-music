// app/api/upload/video/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { Video } from "@/lib/database/models/video";
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
    const videographer = formData.get("videographer")?.toString() || "";
    const genre = formData.get("genre")?.toString();
    const description = formData.get("description")?.toString();
    const releaseDateStr = formData.get("releaseDate")?.toString();
    const tags = (formData.get("tags")?.toString() || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Files
    const videoUrl = formData.get("video")?.toString();
    const thumbnailUrl = formData.get("thumbnail")?.toString();

    if (!title || !artist || !videographer || !thumbnailUrl) {
      return NextResponse.json(
        { error: "Missing required fields: title, artist, videographer, or thumbnail" }
      );
    }


    // Save in DB
    const video = await Video.create({
      author: currentUser?._id,
      title,
      artist,
      videographer,
      genre,
      description,
      releaseDate: releaseDateStr ? new Date(releaseDateStr) : undefined,
      tags,
      videoUrl,
      thumbnailUrl
    });

    return NextResponse.json(video);
    //return corsResponse(video, 201);
  } catch (error) {
    console.error("Error saving video:", error);
    return NextResponse.json(
      { error: "Failed to save video", details: (error as any).message }
    );
  }
}
