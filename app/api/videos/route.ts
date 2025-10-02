import { connectToDatabase } from "@/lib/database";
import Album, { IAlbum } from "@/lib/database/models/album";
import { ISong } from "@/lib/database/models/song";
import Video, { IVideo } from "@/lib/database/models/video";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    // ✅ Fetch albums with populated songs
    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .limit(40)
      .lean<IVideo[]>(); // ensures TS knows this is plain objects

    return NextResponse.json(
      { videos },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("[VIDEOS_FETCH_ERR]", error);
    return NextResponse.json(
      {
        message: "Error fetching videos",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
