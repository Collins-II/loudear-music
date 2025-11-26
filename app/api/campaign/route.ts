// app/api/campaigns/route.ts
import { NextResponse } from "next/server";// your mongoose connect util
import { connectToDatabase } from "@/lib/database";
import { Campaign } from "@/lib/database/models/campaign";

export async function GET(req: Request) {
  await connectToDatabase();
  const url = new URL(req.url);
  const artistId = url.searchParams.get("artistId");
  const campaigns = await Campaign.find(artistId ? { artistId } : {}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ campaigns });
}

export async function POST(req: Request) {
  await connectToDatabase();
  const body = await req.json();
  // validate body here
  const created = await Campaign.create(body);
  return NextResponse.json({ campaign: created });
}
