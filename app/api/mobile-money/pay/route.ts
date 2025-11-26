// app/api/mobile-money/pay/route.ts
import { NextResponse } from "next/server";

// Simulated mobile money flow
export async function POST(req: Request) {
  const body = await req.json(); // { provider, phone, amount, campaignId }
  // Simulate success
  return NextResponse.json({ status: "success", provider: body.provider, phone: body.phone });
}
