import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Hero from "@/lib/database/models/hero";
import cloudinary from "@/lib/cloudinary";

async function bufferFromFile(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await req.formData();
    const cover = formData.get("cover") as File;
    const sections = JSON.parse(formData.get("sections") as string);

    if (!cover || !sections) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // Upload cover to Cloudinary
    const coverBuffer = await bufferFromFile(cover);
    const coverResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "hero", resource_type: "image" },
          (err, result) => (err ? reject(err) : resolve(result))
        )
        .end(coverBuffer);
    });

    const uploadedCover = coverResult as any;

    // Save to MongoDB
    const hero = await Hero.create({
      sections,
      coverUrl: uploadedCover.secure_url,
      publicId: uploadedCover.public_id,
    });

    return NextResponse.json({ success: true, hero });
  } catch (error) {
    console.error("[HERO_UPLOAD_ERR]", error);
    return NextResponse.json(
      { error: "Failed to upload hero section" },
      { status: 500 }
    );
  }
}
