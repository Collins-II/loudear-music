import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Media from "@/lib/database/models/media";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    // Reset previous featured
    await Media.updateMany({}, { featured: false });

    // Set selected media as featured
    await Media.findByIdAndUpdate({mediaId: id}, { featured: true });

    const allMedia = await Media.find();
    return NextResponse.json(allMedia);
  } catch (err) {
    console.error("[MEDIA_FEATURED_ERR]", err);
    return NextResponse.json({ error: "Failed to update featured media" }, { status: 500 });
  }
}
