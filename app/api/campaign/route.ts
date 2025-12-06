import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { Campaign } from "@/lib/database/models/campaign";
import { getCurrentUser } from "@/actions/getCurrentUser";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await connectToDatabase();
  const url = new URL(req.url);
  const artistId = url.searchParams.get("artistId");
  const campaigns = await Campaign.find(artistId ? { artistId } : {}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ campaigns });
}

export async function POST(req: Request) {
  await connectToDatabase();
  const user = await getCurrentUser();
  if (!user?._id) {
    return NextResponse.json({ error: "Unauthorized: user not logged in" }, { status: 401 });
  }

  const body = await req.json();

  // Validate required fields
  const errors: string[] = [];
  if (!body.campaignName) errors.push("campaignName is required");
  if (!body.mediaId) errors.push("mediaId is required");
  if (!body.budget) errors.push("budget is required");

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
  }

  try {
    const created = await Campaign.create({
      ...body,
      artistId: user._id,
      mediaId: new mongoose.Types.ObjectId(body.mediaId), // ensure ObjectId
      status: "draft",
    });

    return NextResponse.json({ campaign: created });
  } catch (err: any) {
    console.error("Campaign creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
