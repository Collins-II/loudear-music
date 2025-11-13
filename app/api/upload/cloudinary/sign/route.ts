import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const timestamp = Math.floor(Date.now() / 1000);
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET!;

  const signature = crypto
    .createHash("sha1")
    .update(`timestamp=${timestamp}&upload_preset=${preset}${process.env.CLOUDINARY_API_SECRET}`)
    .digest("hex");

  return NextResponse.json({
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    uploadPreset: preset,
  });
}
