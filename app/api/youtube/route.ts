import { NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID; // Example @RichBizzy channel ID (replace if needed)
const maxResults = 1000

export async function GET() {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet&order=date&maxResults=${maxResults}`
    );
    const data = await res.json();

    const videos = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
    }));

    return NextResponse.json({ videos });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch YouTube videos" }, { status: 500 });
  }
}
