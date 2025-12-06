import { NextResponse } from "next/server";
import { getCurrentUser } from "@/actions/getCurrentUser";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/database";
import RoyaltySplit from "@/lib/database/models/royalty-splits";


export async function GET(req: Request, { params }: { params: { songId: string } }) {
try {
await connectToDatabase();
const user = await getCurrentUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const { songId } = params;
const splits = await RoyaltySplit.find({ songId: new Types.ObjectId(songId) }).lean();
return NextResponse.json({ splits });
} catch (err: any) {
console.error(err);
return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
}
}


export async function POST(req: Request, { params }: { params: { songId: string } }) {
try {
await connectToDatabase();
const user = await getCurrentUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


const body = await req.json();
const { collaboratorName, collaboratorEmail, percent, role, destination } = body;
if (!collaboratorName || typeof percent !== "number") return NextResponse.json({ error: "Invalid input" }, { status: 400 });


const songId = params.songId;


// ensure percent sum <= 100
const existing = await RoyaltySplit.aggregate([{ $match: { songId: new Types.ObjectId(songId) } }, { $group: { _id: null, total: { $sum: "$percent" } } }]);
const existingTotal = existing?.[0]?.total ?? 0;
if (existingTotal + percent > 100) return NextResponse.json({ error: "Total exceeds 100%" }, { status: 400 });


const doc = await RoyaltySplit.create({
songId: new Types.ObjectId(songId),
ownerId: user._id,
collaboratorName,
collaboratorEmail,
percent,
role,
destination,
verified: false,
});


return NextResponse.json({ success: true, split: doc });
} catch (err: any) {
console.error(err);
return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
}
}


export async function PATCH(req: Request, { params }: { params: { songId: string } }) {
try {
await connectToDatabase();
const user = await getCurrentUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const songId = params.songId;
const body = await req.json();
const { splitId, percent, collaboratorName, destination } = body;
if (!splitId) return NextResponse.json({ error: "splitId required" }, { status: 400 });


const split = await RoyaltySplit.findById(splitId);
if (!split) return NextResponse.json({ error: "Split not found" }, { status: 404 });
if (split.ownerId.toString() !== user._id.toString()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });


// If updating percent, ensure total not exceeding 100
if (typeof percent === "number") {
const others = await RoyaltySplit.aggregate([
{ $match: { songId: new Types.ObjectId(songId), _id: { $ne: split._id } } },
{ $group: { _id: null, total: { $sum: "$percent" } } },
]);
const othersTotal = others?.[0]?.total ?? 0;
if (othersTotal + percent > 100) return NextResponse.json({ error: "Total exceeds 100%" }, { status: 400 });
split.percent = percent;
}


if (collaboratorName) split.collaboratorName = collaboratorName;
if (destination) split.destination = destination;


await split.save();
return NextResponse.json({ success: true, split });
} catch (err: any) {
console.error(err);
return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
}
}


export async function DELETE(req: Request) {
try {
await connectToDatabase();
const user = await getCurrentUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const body = await req.json();
const { splitId } = body;
if (!splitId) return NextResponse.json({ error: "splitId required" }, { status: 400 });
const split = await RoyaltySplit.findById(splitId);
if (!split) return NextResponse.json({ error: "Split not found" }, { status: 404 });
if (split.ownerId.toString() !== user._id.toString()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
await split.remove();
return NextResponse.json({ success: true });
} catch (err: any) {
console.error(err);
return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
}
}