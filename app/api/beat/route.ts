// app/api/beat/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Beat from "@/lib/database/models/beat";
import { getCurrentUser } from "@/actions/getCurrentUser";

interface Producer {
  _id: string;
  name?: string;
  stageName?: string;
  image?: string;
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const genre = url.searchParams.get("genre") || null;
    const sort = url.searchParams.get("sort") || "latest";
    const limit = parseInt(url.searchParams.get("limit") || "100");

    const query: any = {};
    if (genre && genre !== "All") query.genre = genre;

    const beats = await Beat.find(query)
      .populate({
        path: "producer",
        select: "_id name image stageName",
      })
      .limit(limit);

    // Sort client-side
    if (sort === "latest") {
      beats.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    } else if (sort === "popular") {
      beats.sort((a, b) => (b.stats?.plays || 0) - (a.stats?.plays || 0));
    } else if (sort === "price-low") {
      beats.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === "price-high") {
      beats.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    // Map to clean JSON structure
    const data = beats.map((beat) => {
        // Cast producer safely
      const producer = (beat.producer as unknown) as Producer | null;

      return {
        _id: beat._id,
        title: beat.title,
        bpm: beat.bpm,
        key: beat.key,
        genre: beat.genre,
        price: beat.price,
        image: beat.image,
        audioUrl: beat.audioUrl,
        previewUrl: beat.audioSnippet,
        releaseDate: beat.createdAt,
        stats: beat.stats || {},
        producerId: producer?._id || "",
        producerName: producer?.name || producer?.stageName || "Unknown",
        producerImage: producer?.image || null,
      };
    });

    return NextResponse.json({ beats: data }, { status: 200 });
  } catch (error) {
    console.error("GET /api/beats error:", error);
    return NextResponse.json({ message: "Failed to fetch beats" }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const form = await request.formData();

    const title = form.get("title") as string;
    const bpm = form.get("bpm");
    const key = form.get("key") as string;
    const genre = form.get("genre") as string;
    const price = form.get("price");
    const audioUrl = form.get("audioUrl") as string;
    const audioSnippet = form.get("audioSnippet") as string;
    const image = form.get("image") as string | null;
    const published = form.get("published") === "true";

    const licenseTiers = JSON.parse(form.get("licenseTiers") as string);

    const beat = await Beat.create({
      title,
      bpm: bpm ? Number(bpm) : undefined,
      key,
      genre,
      price,
      audioUrl,
      audioSnippet,
      image: image ?? undefined,
      licenseTiers,
      published,
      producer: user._id,
    });

    return NextResponse.json(beat, { status: 201 });

  } catch (error) {
    console.error("POST /api/beat error:", error);
    return NextResponse.json(
      { message: "Failed to create beat" },
      { status: 500 }
    );
  }
}
