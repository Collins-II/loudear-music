import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

// Convert File to Buffer
async function bufferFromFile(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Handle POST uploads
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    type CloudinaryResourceType = "image" | "video" | "raw" | "auto";
    const resourceType =
      (formData.get("resource_type") as CloudinaryResourceType) || "auto";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // convert to buffer
    const buffer = await bufferFromFile(file);

    // upload to cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
