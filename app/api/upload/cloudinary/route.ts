import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

async function bufferFromFile(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";
    const resourceType =
      (formData.get("resource_type") as "image" | "video" | "raw" | "auto") ||
      "auto";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await bufferFromFile(file);

    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType, timeout: 1200000},
        (err, res) => {
          if (err) {
            console.error("Cloudinary upload_stream error:", err);
            reject(err);
          } else {
            resolve(res);
          }
        }
      );
      uploadStream.end(buffer);
    });

    // ✅ Return only safe properties
    return NextResponse.json({
      success: true,
      secure_url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      format: result.format,
      bytes: result.bytes,
      duration: result.duration,
    });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Cloudinary upload failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
