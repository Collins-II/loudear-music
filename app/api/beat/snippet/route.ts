// app/api/beat/snippet/route.ts

import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import fetch from "node-fetch";
import fs from "fs";
import os from "os";
import path from "path";

export const runtime = "nodejs";

interface RequestBody {
  audioUrl: string;
  start: number;
  duration: number;
}

/** Download input file */
async function downloadToFile(url: string, dest: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to download file");
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.promises.writeFile(dest, buffer);
}

export async function POST(req: Request) {
  try {
    const { audioUrl, start, duration } = (await req.json()) as RequestBody;

    if (!audioUrl) {
      return NextResponse.json({ message: "audioUrl required" }, { status: 400 });
    }

    // Temp filepath
    const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "snippet-"));
    const inputPath = path.join(tempDir, "input");

    // Step 1: Download original
    await downloadToFile(audioUrl, inputPath);

    // Step 2: Upload and trim with Cloudinary
    const result = await cloudinary.uploader.upload(inputPath, {
      resource_type: "video",   // audio is uploaded as "video"
      folder: "snippets",
      transformation: [{
        start_offset: start,    // where trimming begins
        duration,               // how long snippet should be
        audio_codec: "mp3"
      }]
    });

    // Cleanup
    await fs.promises.rm(tempDir, { recursive: true, force: true });

    return NextResponse.json({ secure_url: result.secure_url }, { status: 200 });

  } catch (err: any) {
    console.error("SNIPPET ERROR:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
