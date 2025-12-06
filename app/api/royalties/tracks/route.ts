import { NextResponse } from "next/server";
import { getCurrentUser } from "@/actions/getCurrentUser";
import { connectToDatabase } from "@/lib/database";
import { Song } from "@/lib/database/models/song";
import RoyaltySplit from "@/lib/database/models/royalty-splits";


export async function GET() {
try {
await connectToDatabase();
const user = await getCurrentUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


// Fetch user's songs and allocated percent per song
const songs = await Song.find({ author: user._id }).lean();


// get aggregated splits count/percent
const songIds = songs.map((s) => s._id);
const splits = await RoyaltySplit.aggregate([
{ $match: { songId: { $in: songIds } } },
{ $group: { _id: "$songId", totalPercent: { $sum: "$percent" }, count: { $sum: 1 } } },
]);


const byId = splits.reduce((acc: any, s: any) => ({ ...acc, [s._id.toString()]: s }), {});


const payload = songs.map((s: any) => ({
_id: s._id,
title: s.title,
coverUrl: s.coverUrl,
allocatedPercent: byId[s._id.toString()]?.totalPercent ?? 0,
splitsCount: byId[s._id.toString()]?.count ?? 0,
}));


return NextResponse.json({ songs: payload });
} catch (err: any) {
console.error(err);
return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
}
}