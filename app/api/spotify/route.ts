// app/api/spotify/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

const SPOTIFY_BASE = "https://api.spotify.com/v1";
const SPOTIFY_TOKEN = process.env.SPOTIFY_CLIENT_SECRET!; // ⚠️ Must be set via Spotify OAuth or Client Credentials

// ✅ Helper to call Spotify API
async function spotifyFetch(endpoint: string, params?: Record<string, string | number>) {
  const url = new URL(`${SPOTIFY_BASE}${endpoint}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value.toString());
    }
  }

  const res = await axios.get(url.toString(), {
    headers: { Authorization: `Bearer ${SPOTIFY_TOKEN}` },
  });

  return res.data;
}

// =======================================================
// 🟢 Main API Handler
// =======================================================
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Missing 'path' query parameter" }, { status: 400 });
  }

  try {
    const [endpoint, queryString] = path.split("?");
    const params = Object.fromEntries(new URLSearchParams(queryString ?? ""));
    let data: any;

    switch (endpoint) {
      /* =======================================================
         🔍 SEARCH
      ======================================================= */
      case "/search": {
        const query = params.query || "music";
        const type = params.type || "track"; // track | artist | album | playlist
        const limit = parseInt(params.limit || "20", 10);

        data = await spotifyFetch(`/search`, {
          q: query,
          type,
          limit,
          market: "US",
        });
        break;
      }

      /* =======================================================
         🎧 PLAYLIST DETAILS
      ======================================================= */
      case "/playlist": {
        const playlistId = params.browseId;
        if (!playlistId) throw new Error("Missing browseId (playlistId)");
        data = await spotifyFetch(`/playlists/${playlistId}`);
        break;
      }

      /* =======================================================
         👨‍🎤 ARTIST DETAILS
      ======================================================= */
      case "/artist": {
        const artistId = params.browseId;
        if (!artistId) throw new Error("Missing browseId (artistId)");
        const artist = await spotifyFetch(`/artists/${artistId}`);
        const topTracks = await spotifyFetch(`/artists/${artistId}/top-tracks`, { market: "US" });
        const albums = await spotifyFetch(`/artists/${artistId}/albums`, { limit: 10 });
        data = { ...artist, topTracks, albums };
        break;
      }

      /* =======================================================
         💿 ALBUM DETAILS
      ======================================================= */
      case "/album": {
        const albumId = params.browseId;
        if (!albumId) throw new Error("Missing browseId (albumId)");
        data = await spotifyFetch(`/albums/${albumId}`);
        break;
      }

      /* =======================================================
         🎶 SONG DETAILS
      ======================================================= */
      case "/song": {
        const trackId = params.videoId;
        if (!trackId) throw new Error("Missing videoId (trackId)");
        data = await spotifyFetch(`/tracks/${trackId}`);
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown endpoint: ${endpoint}` }, { status: 400 });
    }

    const res = NextResponse.json(data, { status: 200 });
    res.headers.set("Cache-Control", "s-maxage=300, stale-while-revalidate=300");
    return res;
  } catch (error: any) {
    console.error("❌ Spotify API error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Spotify API Error", details: error.response?.data || error.message },
      { status: 500 }
    );
  }
}
