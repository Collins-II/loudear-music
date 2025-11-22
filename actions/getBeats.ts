import { connectToDatabase } from "@/lib/database";
import Beat from "@/lib/database/models/beat";



export type BeatItem = {
_id: string;
title: string;
producerName?: string;
image?: string;
previewUrl?: string;
audioUrl?: string;
bpm?: number;
key?: string;
genre?: string;
mood?: string;
price?: number;
licenseTiers?: any[];
stats?: any;
releaseDate?: string;
};


export async function getBeats(opts: { limit?: number; genre?: string } = {}) {
await connectToDatabase();
const q: any = { published: true };
if (opts.genre && opts.genre !== "All") q.genre = opts.genre;
const beats = await Beat.find(q).sort({ createdAt: -1 }).limit(opts.limit || 200).lean();
return beats as BeatItem[];
}