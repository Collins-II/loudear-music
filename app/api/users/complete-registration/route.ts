import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/database";
import { User } from "@/lib/database/models/user";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 🧩 Update registration fields
    user.stageName = body.stageName || user.stageName;
    user.bio = body.bio || user.bio;
    user.location = body.location || user.location;
    user.phone = body.phone || user.phone;
    user.genres = body.genres || user.genres;
    user.role = body.role || user.role; // fan → artist if applicable

    // ✅ Mark registration as complete
    user.isNewUser = false;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Registration completed successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        stageName: user.stageName,
        bio: user.bio,
        location: user.location,
        phone: user.phone,
        genres: user.genres,
        isNewUser: false,
      },
    });
  } catch (error: any) {
    console.error("Complete registration error:", error);
    return NextResponse.json(
      { error: "Failed to complete registration", details: error.message },
      { status: 500 }
    );
  }
}
