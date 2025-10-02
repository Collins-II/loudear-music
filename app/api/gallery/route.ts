import { connectToDatabase } from "@/lib/database";
import Gallery from "@/lib/database/models/gallery";
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

async function bufferFromFile(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ========== GET GALLERY ITEMS ==========
export async function GET() {
  try {
    await connectToDatabase();

    const gallery = await Gallery.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, gallery });
  } catch (error) {
    console.error("[GALLERY_GET_ERR]", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery items" },
      { status: 500 }
    );
  }
}

// ========== CREATE GALLERY ITEM (POST) ==========
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!imageFile || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Upload image to Cloudinary
    const buffer = await bufferFromFile(imageFile);
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "gallery", resource_type: "image" },
          (err, result) => (err ? reject(err) : resolve(result))
        )
        .end(buffer);
    });

    const uploaded = uploadResult as any;

    const newItem = await Gallery.create({
      title,
      description,
      imageUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error("[GALLERY_POST_ERR]", error);
    return NextResponse.json(
      { error: "Failed to create gallery item" },
      { status: 500 }
    );
  }
}

// ========== UPDATE GALLERY ITEM (PUT) ==========
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await req.formData();
    const itemId = formData.get("id") as string;
    const imageFile = formData.get("image") as File | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!itemId) {
      return NextResponse.json(
        { error: "Missing gallery item id" },
        { status: 400 }
      );
    }

    const updateData: any = { title, description };

    // If new image is provided, upload and replace old one
    if (imageFile) {
      const existing = await Gallery.findById(itemId);
      if (existing?.publicId) {
        await cloudinary.uploader.destroy(existing.publicId);
      }

      const buffer = await bufferFromFile(imageFile);
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "gallery", resource_type: "image" },
            (err, result) => (err ? reject(err) : resolve(result))
          )
          .end(buffer);
      });

      const uploaded = uploadResult as any;
      updateData.imageUrl = uploaded.secure_url;
      updateData.publicId = uploaded.public_id;
    }

    const updatedItem = await Gallery.findByIdAndUpdate(itemId, updateData, {
      new: true,
    });

    if (!updatedItem) {
      return NextResponse.json(
        { error: "Gallery item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error("[GALLERY_PUT_ERR]", error);
    return NextResponse.json(
      { error: "Failed to update gallery item" },
      { status: 500 }
    );
  }
}

// ========== DELETE GALLERY ITEM ==========
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json({ error: "Missing gallery item id" }, { status: 400 });
    }

    const item = await Gallery.findById(itemId);
    if (!item) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }

    // Delete image from Cloudinary
    if (item.publicId) {
      await cloudinary.uploader.destroy(item.publicId);
    }

    await Gallery.findByIdAndDelete(itemId);

    return NextResponse.json({ success: true, message: "Gallery item deleted" });
  } catch (error) {
    console.error("[GALLERY_DELETE_ERR]", error);
    return NextResponse.json(
      { error: "Failed to delete gallery item" },
      { status: 500 }
    );
  }
}
