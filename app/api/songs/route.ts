import { connectToDatabase } from "@/lib/database";
import {Song} from "@/lib/database/models/song";
import { NextResponse } from "next/server";

export async function GET() {
await connectToDatabase();
const songs = await Song.find().sort({ createdAt: -1 }).lean();
return NextResponse.json({ songs });
}
