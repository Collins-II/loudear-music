import { getAllAlbums } from "@/actions/getAlbums";
import { getSongs } from "@/actions/getSongs";
import { getVideos } from "@/actions/getVideos";
import { NextRequest, NextResponse } from "next/server";;

type ContentType = "Music" | "Video" | "Album";

export interface SearchItem {
  id: string;
  title: string;
  artist?: string;
  thumbnail: string;
  type: ContentType;
  downloads?: number;
  description?: string;
  tracks?: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const type = (searchParams.get("type") || "All") as ContentType | "All";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");

  try {
    // Fetch all data (could optimize by filtering in MongoDB)
    const [songs, videos, albums] = await Promise.all([
      getSongs(),
      getVideos(),
      getAllAlbums(),
    ]);

    // Transform API data to unified SearchItem type
    let items: SearchItem[] = [
      ...songs.map((s) => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        thumbnail: s.coverUrl,
        type: "Music" as const,
        downloads: s.downloads,
        description: s.description || undefined,
      })),
      ...videos.map((v) => ({
        id: v.id,
        title: v.title,
        artist: v.artist,
        thumbnail: v.thumbnailUrl,
        type: "Video" as const,
        downloads: v.downloads,
        description: v.description || undefined,
      })),
      ...albums.map((a) => ({
        id: a.id,
        title: a.title,
        artist: a.artist,
        thumbnail: a.coverUrl,
        type: "Album" as const,
        tracks: a.songs.length,
        description: a.description || undefined,
      })),
    ];

    // Apply type filter
    if (type !== "All") {
      items = items.filter((i) => i.type === type);
    }

    // Apply text search
    if (q) {
      const queryLower = q.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(queryLower) ||
          i.artist?.toLowerCase().includes(queryLower) ||
          i.description?.toLowerCase().includes(queryLower)
      );
    }

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = items.slice(start, end);

    return NextResponse.json({
      data: paginated,
      total: items.length,
      page,
      limit,
    });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json({ error: "Failed to fetch search results" }, { status: 500 });
  }
}
