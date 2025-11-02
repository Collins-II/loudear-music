import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { connectToDatabase } from "@/lib/database";
import { Album } from "@/lib/database/models/album";
import { getCurrentUser } from "@/actions/getCurrentUser";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "tmp_uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function corsResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function OPTIONS() {
  return corsResponse({}, 200);
}

/**
 * PATCH handler for resumable upload
 * Receives file chunks + metadata and assembles them when all chunks arrive
 */
export async function PATCH(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const albumId = formData.get("albumId")?.toString();
    const uploadId = formData.get("uploadId")?.toString();
    const chunkIndex = parseInt(formData.get("chunkIndex")?.toString() || "0");
    const totalChunks = parseInt(formData.get("totalChunks")?.toString() || "1");
    const fileName = formData.get("fileName")?.toString() || "song.mp3";

    if (!file || !albumId || !uploadId) {
      return corsResponse({ error: "Missing fields" }, 400);
    }

    await connectToDatabase();
    const currentUser = await getCurrentUser();
    if (!currentUser) return corsResponse({ error: "Unauthorized" }, 401);

    const uploadFolder = path.join(UPLOAD_DIR, uploadId);
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder, { recursive: true });
    }

    const chunkPath = path.join(uploadFolder, `${chunkIndex}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(chunkPath, buffer);

    // When all chunks have arrived
    const uploadedChunks = fs.readdirSync(uploadFolder);
    if (uploadedChunks.length === totalChunks) {
      const finalFilePath = path.join(uploadFolder, fileName);
      const writeStream = fs.createWriteStream(finalFilePath);

      for (let i = 0; i < totalChunks; i++) {
        const chunk = fs.readFileSync(path.join(uploadFolder, `${i}`));
        writeStream.write(chunk);
      }
      writeStream.end();

     await new Promise<void>((resolve, reject) => {
      writeStream.on("finish", () => resolve());
      writeStream.on("error", (err) => reject(err));
     });


      // Upload to Cloudinary (stream)
      const uploadStream = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `albums/${albumId}/songs`,
            resource_type: "video", // works for audio too
          },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        fs.createReadStream(finalFilePath).pipe(stream);
      });

      const result = uploadStream as any;

      // Clean up temporary files
      fs.rmSync(uploadFolder, { recursive: true, force: true });

      // Update album model with song URL (optional)
      await Album.findByIdAndUpdate(albumId, {
        $push: {
          songs: {
            title: fileName.replace(/\.[^/.]+$/, ""),
            fileUrl: result.secure_url,
            duration: null,
          },
        },
      });

      globalThis.io?.emit("album:songUploaded", {
        albumId,
        title: fileName,
        url: result.secure_url,
      });

      return corsResponse({
        message: "Upload completed",
        fileUrl: result.secure_url,
      });
    }

    return corsResponse({
      message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded`,
    });
  } catch (err: any) {
    console.error("Resumable upload error:", err);
    return corsResponse({ error: err.message || "Upload failed" }, 500);
  }
}
