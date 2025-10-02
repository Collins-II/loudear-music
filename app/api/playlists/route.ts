// app/api/playlists/route.ts
import { NextRequest, NextResponse } from "next/server";

interface SpotifyPlaylist {
  id: string;
  name: string;
  images: { url: string }[];
  owner: { display_name: string };
  tracks: { total: number };
}

interface Playlist {
  id: string;
  title: string;
  curator: string;
  image: string;
  tracks: number;
  plays: number; // placeholder popularity
  genre: string; // placeholder
  mood: string;
  region: "global" | "africa" | "us";
  thisWeek?: number;
  lastWeek?: number;
}

let spotifyToken: string | null = null;
let tokenExpiry: number | null = null;

async function getSpotifyToken() {
  if (spotifyToken && tokenExpiry && Date.now() < tokenExpiry - 60000) {
    return spotifyToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify client ID and secret are required");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to fetch Spotify token");

  spotifyToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;
  return spotifyToken;
}

export async function GET(req: NextRequest) {
  try {
    const token = await getSpotifyToken();

    const url = new URL(req.url);
    const region = (url.searchParams.get("region") || "global") as "global" | "africa" | "us";
    const mood = url.searchParams.get("mood") || "All";
    const sort = url.searchParams.get("sort") || "popular";

    // Fetch Spotify featured playlists
    const response = await fetch(
      "https://api.spotify.com/v1/browse/featured-playlists?limit=50",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await response.json();
    if (!data.playlists?.items) {
      return NextResponse.json({ error: "Failed to fetch playlists" }, { status: 500 });
    }

    let playlists: Playlist[] = data.playlists.items.map((p: SpotifyPlaylist, idx: number) => ({
      id: p.id,
      title: p.name,
      curator: p.owner.display_name,
      image: p.images[0]?.url || "/assets/images/default-playlist.jpg",
      tracks: p.tracks.total,
      plays: Math.floor(Math.random() * 20000) + 5000,
      genre: "Mixed",
      mood: ["Love", "Party", "Rap", "Melody", "Romance"][idx % 5],
      region: ["global", "africa", "us"][idx % 3] as "global" | "africa" | "us",
      thisWeek: idx + 1,
      lastWeek: idx + 2,
    }));

    // Server-side filters
    if (region !== "global") playlists = playlists.filter((p) => p.region === region);
    if (mood !== "All") playlists = playlists.filter((p) => p.mood === mood);

    // Sorting
    playlists.sort((a, b) =>
      sort === "popular" ? b.plays - a.plays : (b.thisWeek || 0) - (a.thisWeek || 0)
    );

    return NextResponse.json(playlists);
  } catch (error: any) {
    console.error("Spotify API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
