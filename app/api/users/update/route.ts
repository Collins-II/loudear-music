import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { User } from "@/lib/database/models/user";
import { getCurrentUser } from "@/actions/getCurrentUser";
import cloudinary from "@/lib/cloudinary";

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();

    const session = await getCurrentUser();
    if (!session?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const name = form.get("name") as string;
    const bio = form.get("bio") as string;
    const location = form.get("location") as string;
    const phone = form.get("phone") as string;
    const genres = JSON.parse(form.get("genres") as string);
    const image = form.get("image") as File | null;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let uploadedImageUrl: string | undefined;

    if (image && image.size > 0) {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const upload = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "loudear/avatars", resource_type: "image" },
            (err, result) => (err ? reject(err) : resolve(result))
          )
          .end(buffer);
      });

      uploadedImageUrl = (upload as any).secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      session._id,
      {
        name,
        bio,
        location,
        phone,
        genres,
        ...(uploadedImageUrl ? { image: uploadedImageUrl } : {}),
      },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
