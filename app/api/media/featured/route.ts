import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Media from "@/lib/database/models/media";

export async function GET() {
  try {
    await connectToDatabase();
    const media = await Media.find();
    return NextResponse.json(media);
  } catch (err) {
    console.error("[MEDIA_GET_ERR]", err);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { title, description, type, mediaId } = body;

    if (!title || !mediaId) {
      return NextResponse.json({ error: "Title and media ID are required" }, { status: 400 });
    }

    const newMedia = await Media.create({ title, description, type, mediaId });
    return NextResponse.json(newMedia);
  } catch (err) {
    console.error("[MEDIA_POST_ERR]", err);
    return NextResponse.json({ error: "Failed to add media" }, { status: 500 });
  }
}
