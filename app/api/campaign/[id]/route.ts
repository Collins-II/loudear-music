// app/api/campaigns/[id]/route.ts
import { connectToDatabase } from "@/lib/database";
import { Campaign } from "@/lib/database/models/campaign";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const c = await Campaign.findById(params.id).lean();
  return NextResponse.json({ campaign: c });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const body = await req.json();
  const updated = await Campaign.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json({ campaign: updated });
}
