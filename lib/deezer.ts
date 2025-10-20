// lib/deezer.ts

// ✅ Helper function for API proxy calls
// lib/deezer.ts
const BASE_URL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    : "";

export async function fetchFromProxy(path: string) {
  const url = `${BASE_URL}/api/deezer?path=${encodeURIComponent(path)}`;

  const res = await fetch(url, {
    // ✅ Allow cache revalidation on server
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    console.error("❌ Proxy fetch failed:", res.status, res.statusText);
    throw new Error(`Deezer fetch failed: ${res.status}`);
  }

  return res.json();
}



/* ===========================================================
   🎵 PLAYLISTS
=========================================================== */

export async function fetchPlaylists(
  mood: string = "All",
  region: string = "global",
  sort: string = "relevance",
  limit: number = 20
) {
  try {
    let query = mood !== "All" ? mood : "music";
    if (region && region !== "global") query += ` ${region}`;

    const data = await fetchFromProxy(`/search/playlist?q=${query}&limit=${limit}`);
    let items: any[] = data?.data ?? [];

    items = items.filter((p) => p && p.id && p.title);

    if (sort === "alpha") {
      items.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "tracks") {
      items.sort((a, b) => (b.nb_tracks ?? 0) - (a.nb_tracks ?? 0));
    }

    console.log("PLAYLIST_DATA", items)

    return items.map((p) => ({
      id: p.id,
      title: p.title,
      curator: p.user?.name ?? "Unknown",
      image: p.picture_medium ?? "/placeholder.jpg",
      tracks: p.nb_tracks ?? 0,
    }));
  } catch (err) {
    console.error("Deezer fetchPlaylists error:", err);
    return [];
  }
}

/* ===========================================================
   🎧 PLAYLIST DETAILS
=========================================================== */

/* ===========================================================
   🎧 PLAYLIST DETAILS (Fixed)
=========================================================== */

export interface DeezerTrack {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  preview?: string;
}

export interface DeezerPlaylist {
  id: number;
  title: string;
  curator: string;
  image: string;
  description: string;
  genre: string;
  tracks: DeezerTrack[];
}

export async function fetchPlaylistById(id: string): Promise<DeezerPlaylist | null> {
  try {
    // 1️⃣ Fetch playlist metadata from proxy (handles CORS/cache)
   
    // 2️⃣ Fetch playlist tracks directly from Deezer’s tracklist endpoint
    const trackUrl = `https://api.deezer.com/playlist/${id}/tracks`;
    const res = await fetch(trackUrl);

    console.log("PLAYLIST_ID_DATA", res)

    if (!res.ok) {
      console.error("❌ Failed to fetch tracks:", res.statusText);
      return null;
    }

    const trackJson = await res.json();
    const trackArray: any[] = Array.isArray(trackJson.data) ? trackJson.data : [];

    console.log("✅ Deezer playlist:", trackJson, "• Tracks:", trackArray.length);

    // 3️⃣ Infer mood/genre from title
    /*let inferredMood = "Mixed";
    const title = (data.title ?? "").toLowerCase();
    if (title.includes("chill")) inferredMood = "Chill";
    else if (title.includes("rap")) inferredMood = "Rap / Hip-Hop";
    else if (title.includes("party")) inferredMood = "Party";
    else if (title.includes("focus")) inferredMood = "Focus";
    else if (title.includes("love")) inferredMood = "Love / Romantic";
    else if (title.includes("workout")) inferredMood = "Workout";

    // 4️⃣ Map tracks safely
    const tracks: DeezerTrack[] = trackArray.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist?.name ?? "Unknown",
      album: t.album?.title ?? "Unknown",
      duration: t.duration
        ? `${Math.floor(t.duration / 60)}:${(t.duration % 60)
            .toString()
            .padStart(2, "0")}`
        : "0:00",
      preview: t.preview,
    }));

    // 5️⃣ Return normalized playlist object
    return {
      id: data.id,
      title: data.title,
      curator: data.user?.name ?? data.creator?.name ?? "Unknown",
      image: data.picture_xl ?? "/placeholder.jpg",
      description: data.description ?? "",
      genre: inferredMood,
      tracks,
    };*/
    return trackJson
  } catch (err) {
    console.error("❌ Deezer fetchPlaylistById error:", err);
    return null;
  }
}



/* ===========================================================
   👨‍🎤 ARTIST DETAILS
=========================================================== */

export async function fetchArtistById(id: string) {
  try {
    const data = await fetchFromProxy(`/artist/${id}`);
    return {
      id: data.id,
      name: data.name,
      picture: data.picture_xl ?? "/placeholder.jpg",
      fans: data.nb_fan,
      albums: data.nb_album,
      link: data.link,
    };
  } catch (err) {
    console.error("Deezer fetchArtistById error:", err);
    return null;
  }
}

/* ===========================================================
   💿 ALBUM DETAILS
=========================================================== */

export async function fetchAlbumById(id: string) {
  try {
    const data = await fetchFromProxy(`/album/${id}`);

    const tracks =
      data.tracks?.data?.map((t: any) => ({
        id: t.id,
        title: t.title,
        duration: t.duration
          ? `${Math.floor(t.duration / 60)}:${(t.duration % 60)
              .toString()
              .padStart(2, "0")}`
          : "0:00",
        preview: t.preview,
      })) ?? [];

    return {
      id: data.id,
      title: data.title,
      cover: data.cover_xl ?? "/placeholder.jpg",
      artist: data.artist?.name ?? "Unknown",
      genre: data.genres?.data?.[0]?.name ?? "Unknown",
      releaseDate: data.release_date,
      tracks,
    };
  } catch (err) {
    console.error("Deezer fetchAlbumById error:", err);
    return null;
  }
}

/* ===========================================================
   🔥 TRENDING / CHARTS
=========================================================== */

export async function fetchTrending() {
  try {
    const data = await fetchFromProxy(`/chart`);
    const tracks = data.tracks?.data ?? [];
    const artists = data.artists?.data ?? [];
    const albums = data.albums?.data ?? [];

    return {
      topTracks: tracks.map((t: any) => ({
        id: t.id,
        title: t.title,
        artist: t.artist?.name,
        album: t.album?.title,
        preview: t.preview,
      })),
      topArtists: artists.map((a: any) => ({
        id: a.id,
        name: a.name,
        picture: a.picture_medium,
      })),
      topAlbums: albums.map((a: any) => ({
        id: a.id,
        title: a.title,
        cover: a.cover_medium,
        artist: a.artist?.name,
      })),
    };
  } catch (err) {
    console.error("Deezer fetchTrending error:", err);
    return { topTracks: [], topArtists: [], topAlbums: [] };
  }
}
