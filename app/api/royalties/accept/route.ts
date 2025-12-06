import { NextResponse } from "next/server";
import { getCurrentUser } from "@/actions/getCurrentUser";
import { connectToDatabase } from "@/lib/database";
import RoyaltySplit from "@/lib/database/models/royalty-splits";


export async function POST(req: Request) {
try {
await connectToDatabase();
const user = await getCurrentUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


const { token } = await req.json();
if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });


const split = await RoyaltySplit.findOne({ inviteToken: token });
if (!split) return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });


// require that logged in user's email matches invited email
if (!user.email || user.email.toLowerCase() !== (split.collaboratorEmail || "").toLowerCase()) {
return NextResponse.json({ error: "Signed in account email does not match invite email" }, { status: 403 });
}


split.verified = true;
split.collaboratorUserId = user._id;
split.inviteToken = undefined;
await split.save();


return NextResponse.json({ success: true, split });
} catch (err: any) {
console.error(err);
return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
}
}