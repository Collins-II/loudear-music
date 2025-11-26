// app/api/optimize/route.ts
import { connectToDatabase } from "@/lib/database";
import { Campaign } from "@/lib/database/models/campaign";
import { NextResponse } from "next/server";

/**
 * Simple optimizer endpoint: you can call it from a CRON worker or the dashboard
 * It runs a set of heuristics and updates campaigns: auto-boost or pause.
 */
export async function POST(req: Request) {
  await connectToDatabase();
  const body = await req.json(); // { campaignId? }
  const campaigns = body.campaignId ? await Campaign.find({ _id: body.campaignId }) : await Campaign.find({ status: "running" });
  for (const c of campaigns) {
    const ims = c.performance.impressions || 0;
    const clicks = c.performance.clicks || 0;
    const ctr = clicks / Math.max(1, ims);
    if (c.schedule?.autoStop && ctr < 0.002) {
      c.status = "paused";
      await c.save();
    } else if (c.schedule?.autoBoost && ctr > 0.06) {
      c.budget = c.budget * 1.2;
      await c.save();
    }
  }
  return NextResponse.json({ ok: true, checked: campaigns.length });
}
