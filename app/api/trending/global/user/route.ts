import { NextResponse } from "next/server";
import { getTrendingByUserGlobal } from "@/actions/getTrendingGlobal";

/**
 * GET /api/trending
 * Returns global top trending songs, albums, and videos combined.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const sinceDays = parseInt(searchParams.get("sinceDays") || "365", 10);

    // Fetch combined global trending data
    const globalTrends = await getTrendingByUserGlobal({ limit, sinceDays });

    // Optional: Emit real-time updates if socket.io is enabled
    if (globalThis.io) {
      globalThis.io.emit("trending:update:global", { items: globalTrends });
    }

    return NextResponse.json({
      success: true,
      total: globalTrends.length,
      items: globalTrends,
      meta: {
        sinceDays,
        limit,
        message: "Global top trending songs, albums, and videos",
      },
    });
  } catch (error: any) {
    console.error("[API /trending] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
