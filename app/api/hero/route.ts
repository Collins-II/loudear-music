import { connectToDatabase } from "@/lib/database";
import Hero from "@/lib/database/models/hero";
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

async function bufferFromFile(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ========== GET HERO (FETCH) ==========
export async function GET() {
  try {
    await connectToDatabase();

    const hero = await Hero.findOne().sort({ createdAt: -1 }).lean();

    if (!hero) {
      return NextResponse.json({ hero: null });
    }

    return NextResponse.json({ success: true, hero });
  } catch (error) {
    console.error("[HERO_GET_ERR]", error);
    return NextResponse.json(
      { error: "Failed to fetch hero section" },
      { status: 500 }
    );
  }
}

// ========== UPDATE HERO (PUT) ==========
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await req.formData();
    const heroId = formData.get("heroId") as string;
    const cover = formData.get("cover") as File | null;
    const sections = JSON.parse(formData.get("sections") as string);

    if (!heroId || !sections) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    let coverUrl: string | undefined;
    let publicId: string | undefined;

    // If cover is provided, upload to Cloudinary
    if (cover) {
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
      coverUrl = uploadedCover.secure_url;
      publicId = uploadedCover.public_id;
    }

    // Update in MongoDB
    const updatedHero = await Hero.findByIdAndUpdate(
      heroId,
      {
        sections,
        ...(coverUrl && { coverUrl }),
        ...(publicId && { publicId }),
      },
      { new: true }
    );

    if (!updatedHero) {
      return NextResponse.json(
        { error: "Hero not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, hero: updatedHero });
  } catch (error) {
    console.error("[HERO_PUT_ERR]", error);
    return NextResponse.json(
      { error: "Failed to update hero section" },
      { status: 500 }
    );
  }
}

// ---------- DELETE HERO ----------
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const heroId = searchParams.get("id");

    if (!heroId) {
      return NextResponse.json({ error: "Missing heroId" }, { status: 400 });
    }

    const hero = await Hero.findById(heroId);
    if (!hero) {
      return NextResponse.json({ error: "Hero not found" }, { status: 404 });
    }

    // Delete cover from Cloudinary if exists
    if (hero.publicId) {
      await cloudinary.uploader.destroy(hero.publicId);
    }

    await Hero.findByIdAndDelete(heroId);

    return NextResponse.json({ success: true, message: "Hero deleted" });
  } catch (error) {
    console.error("[HERO_DELETE_ERR]", error);
    return NextResponse.json({ error: "Failed to delete hero" }, { status: 500 });
  }
}