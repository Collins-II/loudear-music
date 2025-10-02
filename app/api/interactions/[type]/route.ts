import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { Song } from "@/lib/database/models/song";
import { Album } from "@/lib/database/models/album";
import { Video } from "@/lib/database/models/video";

const modelMap: Record<string, any> = { Song, Album, Video };

export async function POST(req: NextRequest, { params }: { params: { type: string } }) {
  try {
    const { type } = params;
    const { id, model, userId }: { id: string; model: keyof typeof modelMap; userId: string } = await req.json();

    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, error: "Invalid ID" });
    }

    const Model = modelMap[model];
    if (!Model) return NextResponse.json({ success: false, error: "Invalid model" });

    const doc = await Model.findById(id);
    if (!doc) return NextResponse.json({ success: false, error: `${model} not found` });

    // ✅ Add/remove userId from interaction array
    let updated = false;
    const field = `${type}s`; // "likes", "shares", "downloads", "views"

    if (!Array.isArray(doc[field])) doc[field] = [];

    const already = doc[field].some((u: any) => u.toString() === userId);

    if (type === "like") {
      if (already) {
        doc[field] = doc[field].filter((u: any) => u.toString() !== userId);
      } else {
        doc[field].push(userId);
      }
      updated = true;
    } else if (!already) {
      doc[field].push(userId);
      updated = true;
    }

    if (updated) await doc.save();

    // ✅ Broadcast via socket.io (step 3)
    globalThis.io?.to(id).emit("interaction:update", {
      id,
      model,
      type,
      counts: {
        likes: doc.likes.length,
        shares: doc.shares.length,
        downloads: doc.downloads.length,
        views: doc.views.length,
      },
      userLiked: doc.likes.some((u: any) => u.toString() === userId),
    });

    return NextResponse.json({
      success: true,
      counts: {
        likes: doc.likes.length,
        shares: doc.shares.length,
        downloads: doc.downloads.length,
        views: doc.views.length,
      },
      userLiked: doc.likes.some((u: any) => u.toString() === userId),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Server error" });
  }
}
