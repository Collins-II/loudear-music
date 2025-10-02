import { NextResponse } from "next/server";
import { getCharts, getTopVideos } from "@/actions/getCharts";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = (searchParams.get("category") as "songs" | "albums" | "videos") || "songs";
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  try {
    // fetch charts
    const charts = await getCharts({ category, limit });

    // ✅ Emit real-time update to connected clients via globalThis.io
    if (globalThis.io) {
      // Broadcast to all clients
      globalThis.io.emit("trending:update", { category, charts });

      // Optionally, also broadcast to category-specific rooms
      globalThis.io.to(`charts:${category}`).emit("trending:update", { category, charts });
    }

    // if category is videos, also send top 10
    let topVideos: any = [];
    if (category === "videos") {
      topVideos = await getTopVideos(10);
    }

    return NextResponse.json({
      category,
      charts,
      topVideos,
    });
  } catch (error: any) {
    console.error("[API /trending] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
