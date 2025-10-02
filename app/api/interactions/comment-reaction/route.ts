// app/api/interactions/comment-reaction/route.ts
import { connectToDatabase } from "@/lib/database";
import { Comment } from "@/lib/database/models/comment";
import { NextResponse } from "next/server";
import {Types } from "mongoose";

type ReactionType = "heart" | "fire" | "laugh" | "up" | "down";

interface ReactionPayload {
  id: string; // Comment ID
  type: ReactionType;
  userId: string;
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const { id, type, userId }: ReactionPayload = await req.json();

    if (!id || !type || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // ✅ Fetch comment
    const comment = await Comment.findById(id);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Initialize reactions object if not present
    if (!comment.reactions) {
      comment.reactions = {
        heart: 0,
        fire: 0,
        laugh: 0,
        up: 0,
        down: 0,
      };
    }

    // Toggle reaction: increment if not reacted, decrement if already reacted
    // For simplicity, we just increment the count
    comment.reactions[type] = (comment.reactions[type] || 0) + 1;

    await comment.save();

    // ✅ Fetch updated comment with reactions for return
    const updatedComment = await Comment.findById(id)
      .populate("user", "name image")
      .lean<{ reactions: Record<ReactionType, number> ,targetModel:string ,targetId:Types.ObjectId}>();

    // ✅ Emit socket event
    if (globalThis.io) {
      const room = `${updatedComment?.targetModel}:${updatedComment?.targetId}`;
      globalThis.io.to(room).emit("comment:reaction", {
        commentId: id,
        reactions: updatedComment?.reactions ?? {},
      });
    }

    return NextResponse.json({ success: true, reactions: updatedComment?.reactions });
  } catch (err: any) {
    console.error("Error updating comment reaction:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
