import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { Album } from "@/lib/database/models/album";
import { Song } from "@/lib/database/models/song";
import { Video } from "@/lib/database/models/video"; // 👈 Make sure you have this model
import { getCurrentUser } from "@/actions/getCurrentUser";

// ==============================
// Helpers
// ==============================

function corsResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function OPTIONS() {
  return corsResponse({}, 200);
}

// ==============================
// PATCH: Dynamic Visibility Update
// ==============================
/**
 * PATCH /api/visibility/[type]/[id]
 * Body: { visibility: "public" | "private" | "unlisted" }
 * Type can be: "albums" | "songs" | "videos"
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return corsResponse({ error: "Unauthorized" }, 401);
    }

    const { type, id } = await params;
    const { visibility } = await req.json();

    if (!["public", "private", "unlisted"].includes(visibility)) {
      return corsResponse(
        { error: "Invalid visibility. Use: public, private, or unlisted." },
        400
      );
    }

    // Determine model dynamically
    let Model: any;
    switch (type) {
      case "albums":
        Model = Album;
        break;
      case "songs":
        Model = Song;
        break;
      case "videos":
        Model = Video;
        break;
      default:
        return corsResponse({ error: "Invalid content type." }, 400);
    }

    // Find document
    const doc = await Model.findById(id);
    if (!doc) {
      return corsResponse({ error: `${type.slice(0, -1)} not found.` }, 404);
    }

    // Check ownership
    if (doc.author.toString() !== currentUser._id.toString()) {
      return corsResponse({ error: "Forbidden" }, 403);
    }

    // === Handle Album ===
    if (type === "albums") {
      doc.visibility = visibility;
      await doc.save();

      // Cascade visibility to all songs under this album
      await Song.updateMany({ _id: { $in: doc.songs } }, { $set: { visibility } });

      return corsResponse({
        success: true,
        message: `Album and its songs updated to '${visibility}'.`,
        id,
      });
    }

    // === Handle Song or Video ===
    doc.visibility = visibility;
    await doc.save();

    return corsResponse({
      success: true,
      message: `${type.slice(0, -1)} visibility updated to '${visibility}'.`,
      id,
    });
  } catch (error: any) {
    console.error("Error updating visibility:", error);
    return corsResponse(
      { error: "Failed to update visibility", details: error.message },
      500
    );
  }
}
