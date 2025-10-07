import { NextResponse } from "next/server";
import { getCharts, getTrending } from "@/actions/getCharts";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category =
    (searchParams.get("category") as "songs" | "albums" | "videos") || "songs";
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  try {
    // fetch charted data
    const charts = await getCharts({ category, limit });

    // optionally fetch top trending videos if category === "videos"
    let topVideos: any[] = [];
    if (category === "videos") {
      topVideos = await getTrending({
        model: "Video",
        limit: 10,
        sinceDays: 30,
      });
    }

    // normalize charts for front-end trending display
    const items = charts.map((chart: any, i: number) => ({
      id: chart._id?.toString?.() || chart.id || `item-${i}`,
      title: chart.title || chart.name || "Untitled",
      artist: chart.artist || chart.creator || "Unknown Artist",
      cover:
        chart.coverImage || chart.image || chart.thumbnail || "/placeholder.png",
      rank: i + 1,
      score: chart.score || chart.plays || chart.views || 0,
    }));

    // ✅ Emit live update for connected clients (optional)
    if (globalThis.io) {
      globalThis.io.emit("trending:update", { category, items });
      globalThis.io.to(`charts:${category}`).emit("trending:update", {
        category,
        items,
      });
    }

    return NextResponse.json({
      category,
      items,
      topVideos,
    });
  } catch (error: any) {
    console.error("[API /trending] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
