import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import PressRelease from "@/lib/database/models/press";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    // Find press release first
    const pressRelease = await PressRelease.findById(id);
    if (!pressRelease) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Collect any cloudinary publicIds in sections
    const publicIds: string[] = [];
    pressRelease.sections.forEach((section: any) => {
      if (section.publicId) {
        publicIds.push(section.publicId);
      }
    });

    // Delete from Cloudinary (images, videos)
    if (publicIds.length > 0) {
      await Promise.all(
        publicIds.map(
          (pid) =>
            new Promise((resolve) => {
              cloudinary.uploader.destroy(pid, () => resolve(true));
            })
        )
      );
    }

    // Delete from DB
    await PressRelease.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Press release deleted" });
  } catch (error) {
    console.error("[PRESS_RELEASE_DELETE_ERR]", error);
    return NextResponse.json(
      { error: "Failed to delete press release" },
      { status: 500 }
    );
  }
}
