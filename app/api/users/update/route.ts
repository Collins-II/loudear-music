import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { User } from "@/lib/database/models/user"; // adjust path if needed
import { getCurrentUser } from "@/actions/getCurrentUser";

export async function PATCH(req: Request) {
  try {
    // ✅ Ensure MongoDB connection
    await connectToDatabase();

    // ✅ Get current logged-in user
    const session = await getCurrentUser();
    if (!session?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session._id;
    const body = await req.json();

    const { bio, location, phone, genres, role } = body;

    // ✅ Validate fields
    if (!role ||!bio || !location || !phone || !Array.isArray(genres) || genres.length === 0) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // ✅ Update user in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        bio,
        location,
        phone,
        role,
        genres,
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
