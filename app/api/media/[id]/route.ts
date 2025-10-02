import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Media from "@/lib/database/models/media";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    await Media.findByIdAndDelete({mediaId: id});
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[MEDIA_DELETE_ERR]", err);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
