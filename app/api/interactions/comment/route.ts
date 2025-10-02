// app/api/interactions/comment/route.ts
import { connectToDatabase } from "@/lib/database";
import { Comment } from "@/lib/database/models/comment";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { id, model, userId, content, parent } = await req.json();

    if (!id || !model || !userId || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // ✅ Create new comment (or reply)
    const newComment = await Comment.create({
      user: userId,
      targetModel: model,
      targetId: id,
      parent: parent || null,
      content,
    });

    // ✅ If it's a reply, update the parent comment
    if (parent) {
      await Comment.findByIdAndUpdate(parent, {
        $push: { replies: newComment._id },
      });
    }

    // ✅ Populate author for return + socket broadcast
    const populated = await Comment.findById(newComment._id)
      .populate("user", "name image")
      .lean();

// ✅ Emit real-time socket update
if (globalThis.io) {
  const room = `${model}:${id}`; // match client join
  globalThis.io.to(room).emit("comment:new", {
    room, // <-- send full room string
    comment: populated,
    parent: parent || null,
  });
}


    return NextResponse.json({ success: true, comment: populated });
  } catch (err: any) {
    console.error("Error adding comment:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
