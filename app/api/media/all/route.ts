import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Media from "@/lib/database/models/media";

export async function GET() {
  try {
    await connectToDatabase();
    const media = await Media.find({}, { id: 1, title: 1, _id: 0 });
    return NextResponse.json(media);
  } catch (err) {
    console.error("[MEDIA_ALL_GET_ERR]", err);
    return NextResponse.json({ error: "Failed to fetch all media" }, { status: 500 });
  }
}
