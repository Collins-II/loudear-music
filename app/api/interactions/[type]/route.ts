import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { Song } from "@/lib/database/models/song";
import { Album } from "@/lib/database/models/album";
import { Video } from "@/lib/database/models/video";

// ✅ Model map
const modelMap = { Song, Album, Video } as const;

// ✅ Use Next.js inferred context type — do NOT manually define RouteContext
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ type: string }> }
) {
  const { type } = await context.params;

  try {
    const { id, model, userId }: { id: string; model: keyof typeof modelMap; userId: string } =
      await req.json();

    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }

    const Model = modelMap[model];
    if (!Model) {
      return NextResponse.json({ success: false, error: "Invalid model" }, { status: 400 });
    }

    const doc = await Model.findById(id);
    if (!doc) {
      return NextResponse.json({ success: false, error: `${model} not found` }, { status: 404 });
    }

    const field = `${type}s`; // likes, shares, downloads, views

    if (!Array.isArray(doc[field])) {
      doc[field] = [];
    }

    const already = doc[field].some((u: any) => u.toString() === userId);
    let updated = false;

    if (type === "like") {
      // ✅ Toggle like
      if (already) {
        doc[field] = doc[field].filter((u: any) => u.toString() !== userId);
      } else {
        doc[field].push(userId);
      }
      updated = true;
    } else if (!already) {
      // ✅ Add once for other types
      doc[field].push(userId);
      updated = true;
    }

    if (updated) await doc.save();

    const counts = {
      likes: doc.likes?.length ?? 0,
      shares: doc.shares?.length ?? 0,
      downloads: doc.downloads?.length ?? 0,
      views: doc.views?.length ?? 0,
    };

    const userLiked = doc.likes?.some((u: any) => u.toString() === userId) ?? false;

    globalThis.io?.to(id).emit("interaction:update", {
      id,
      model,
      type,
      counts,
      userLiked,
    });

    return NextResponse.json({ success: true, counts, userLiked });
  } catch (err) {
    console.error("Interaction error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

