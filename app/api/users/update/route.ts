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
    const stageName = form.get("stageName") as string;
    const role = form.get("role") as "fan" | "artist" | null;

    const genres = form.get("genres")
      ? JSON.parse(form.get("genres") as string)
      : [];
    const socials = form.get("socials")
      ? JSON.parse(form.get("socials") as string)
      : {};
    const payout = form.get("payout")
      ? JSON.parse(form.get("payout") as string)
      : {};
    const image = form.get("image") as File | null;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let uploadedImageUrl: string | undefined;
    if (image && image.size > 0) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const upload = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "loudear/avatars",
              resource_type: "image",
              transformation: [
                {
                  width: 500,
                  height: 500,
                  crop: "fill",
                  gravity: "face",
                  radius: "max",
                },
              ],
            },
            (err, result) => (err ? reject(err) : resolve(result))
          )
          .end(buffer);
      });
      uploadedImageUrl = (upload as any).secure_url;
    }

    const updatePayload = {
      name,
      bio,
      location,
      phone,
      stageName,
      role,
      genres,
      socialLinks: socials,
      payment: {
        mobileMoney: {
          provider: payout.network || undefined,
          phoneNumber: payout.phone || undefined,
        },
      },
      ...(uploadedImageUrl ? { image: uploadedImageUrl } : {}),
    };

    const updatedUser = await User.findByIdAndUpdate(
      session._id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("[PROFILE_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
