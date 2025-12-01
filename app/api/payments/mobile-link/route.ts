import { getCurrentUser } from "@/actions/getCurrentUser";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/database/models/user";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
try {
const body = await req.json();
const { provider, phoneNumber } = body;
if (!provider || !phoneNumber) {
return NextResponse.json({ success: false, error: "provider and phoneNumber required" }, { status: 400 });
}


await connectToDatabase();
const user = await getCurrentUser();
if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });


user.payment = user.payment || {};
user.payment.mobileMoney = {
provider,
phoneNumber,
verified: false,
country: body.country || "ZM",
};
user.payment.payoutEnabled = Boolean(body.payoutEnabled ?? user.payment.payoutEnabled);


await User.findByIdAndUpdate(user._id, { $set: { payment: user.payment } }, { new: true });


return NextResponse.json({ success: true });
} catch (err) {
console.error(err);
return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
}
}