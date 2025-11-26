// app/api/artist/[id]/analytics/route.ts
import { NextResponse } from "next/server";
import type { ArtistAnalyticsResponse } from "@/types/analytics";

function fakeTimeseries(days = 30) {
  const today = Date.now();
  return Array.from({ length: days }).map((_, i) => {
    const date = new Date(today - (days - 1 - i) * 24 * 3600 * 1000);
    return { date: date.toISOString().slice(0,10), plays: Math.round(50 + Math.sin(i/4) * 20 + Math.random()*40) };
  });
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = params.id || "me";
  const timeseries = fakeTimeseries(30);
  const topTracks = Array.from({ length: 6 }).map((_, i) => ({
    id: `t-${i}`,
    title: `Track ${i+1}`,
    plays: Math.round(5000 / (i+1) + Math.random() * 200),
    listeners: Math.round(1000 / (i+1) + Math.random() * 100),
    revenueCents: Math.round(Math.random() * 5000),
    duration: 180 + i * 10,
    image: `/assets/images/placeholder_cover.jpg`,
  }));

  const geo = [
    { country: "United States", code: "US", plays: 10234 },
    { country: "United Kingdom", code: "GB", plays: 4321 },
    { country: "Zambia", code: "ZM", plays: 3210 },
    { country: "Nigeria", code: "NG", plays: 2100 },
  ];

  const overview = {
    playsToday: Math.round(120 + Math.random()*400),
    listenersToday: Math.round(80 + Math.random()*300),
    revenueCents: 12345,
    plays30d: timeseries.reduce((s, d) => s + d.plays, 0),
  };

  const payload: ArtistAnalyticsResponse = {
    artistId: id,
    overview,
    timeseries,
    topTracks,
    geo,
  };

  return NextResponse.json(payload, { status: 200 });
}
