// app/api/deezer/route.ts
import { NextResponse } from "next/server";

const DEEZER_BASE_URL = "https://api.deezer.com";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");
    if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

    const target = `${DEEZER_BASE_URL}${path}`;
    console.log("🎯 Fetching from Deezer:", target); // <--- ADD THIS LINE

    const res = await fetch(target);
    const data = await res.json();

    return NextResponse.json(data, {
      headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("Deezer proxy error:", error);
    return NextResponse.json({ error: "Failed to fetch from Deezer" }, { status: 500 });
  }
}
