import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { User } from "@/lib/database/models/user";
import { getCurrentUser } from "@/actions/getCurrentUser";

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
    const role = form.get("role") as "fan" | "artist";
    const imageUrlString = form.get("imageUrl") as string;

    const genres = JSON.parse(form.get("genres") as string || "[]");
    const socials = JSON.parse(form.get("socials") as string || "{}");
    const payout = JSON.parse(form.get("payout") as string || "{}");

    // Backend NO LONGER expects File
    const finalImageUrl = imageUrlString || "";

    const updatePayload = {
      name,
      bio,
      location,
      phone,
      role,
      stageName: role === "artist" ? stageName : "",
      genres,
      socialLinks: socials,
      image: finalImageUrl,
      payment: {
        mobileMoney: {
          provider: payout.network || undefined,
          phoneNumber: payout.phone || undefined,
        },
      },
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
