// app/api/payment/payout-settings/route.ts
import { getCurrentUser } from "@/actions/getCurrentUser";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/database/models/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Connect to DB
    await connectToDatabase();

    // Get logged-in user
    const currentUser = await getCurrentUser();
    if (!currentUser?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { autoPayout, payoutFrequency, payoutTime } = await req.json();

    if (typeof autoPayout !== "boolean" && !payoutFrequency && !payoutTime) {
      return NextResponse.json({ success: false, error: "No valid fields to update" }, { status: 400 });
    }

    // Update user
    const updateData: any = {};
    if (typeof autoPayout === "boolean") updateData["payment.payoutEnabled"] = autoPayout;
    if (payoutFrequency) updateData["payment.payoutFrequency"] = payoutFrequency;
    if (payoutTime) updateData["payment.payoutTime"] = payoutTime;

    const user = await User.findOneAndUpdate(
      { email: currentUser?.email },
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Payout settings updated", payoutSettings: user.payment });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message || "Server error" }, { status: 500 });
  }
}
