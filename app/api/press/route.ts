import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Press from "@/lib/database/models/press";
import cloudinary from "@/lib/cloudinary";

async function bufferFromFile(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await req.formData();
    const sections = JSON.parse(formData.get("sections") as string);

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: "Missing or invalid sections" },
        { status: 400 }
      );
    }

    // Upload images for each section if present
    const updatedSections = await Promise.all(
      sections.map(async (section: any) => {
        const file = formData.get(`file-${section.id}`) as File | null;

        if (file) {
          const buffer = await bufferFromFile(file);
          const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                { folder: "press-release", resource_type: "image" },
                (err, result) => (err ? reject(err) : resolve(result))
              )
              .end(buffer);
          });

          const uploaded = uploadResult as any;
          return {
            ...section,
            image: uploaded.secure_url,
            publicId: uploaded.public_id,
          };
        }

        return section;
      })
    );

    // Save to DB
    const pressRelease = await Press.create({
      sections: updatedSections,
    });

    return NextResponse.json({ success: true, pressRelease });
  } catch (error) {
    console.error("[PRESS_RELEASE_UPLOAD_ERR]", error);
    return NextResponse.json(
      { error: "Failed to upload press release" },
      { status: 500 }
    );
  }
}

// GET all press releases
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    let result;
    if (id) {
      // Fetch single press release
      result = await Press.findById(id).lean();
      if (!result) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    } else {
      // Fetch all press releases
      result = await Press.find().sort({ createdAt: -1 }).lean();
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[PRESS_RELEASE_GET_ERR]", error);
    return NextResponse.json(
      { error: "Failed to fetch press releases" },
      { status: 500 }
    );
  }
}
