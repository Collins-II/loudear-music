import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { Album } from "@/lib/database/models/album";
import { getCurrentUser } from "@/actions/getCurrentUser";
import cloudinary from "@/lib/cloudinary";

function corsResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();
    if (!currentUser) return corsResponse({ error: "Unauthorized" }, 401);

    const formData = await req.formData();
    const albumId = formData.get("albumId")?.toString();
    const file = formData.get("file") as File;

    if (!albumId || !file)
      return corsResponse({ error: "Missing albumId or file" }, 400);

    const album = await Album.findById(albumId);
    if (!album) return corsResponse({ error: "Album not found" }, 404);
    if (album.author.toString() !== currentUser._id.toString())
      return corsResponse({ error: "Forbidden" }, 403);

    const buffer = await bufferFromFile(file);
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: `albums/${albumId}/cover`, resource_type: "image" },
        (err, res) => (err ? reject(err) : resolve(res))
      ).end(buffer);
    });

    album.coverUrl = result.secure_url;
    await album.save();

    globalThis.io?.emit("album:coverUploaded", {
      albumId,
      coverUrl: result.secure_url,
    });

    return corsResponse({ coverUrl: result.secure_url });
  } catch (err: any) {
    console.error("COVER Upload error:", err);
    return corsResponse({ error: "Failed to upload cover" }, 500);
  }
}
