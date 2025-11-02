// lib/youtube.ts

// ✅ Helper function for API proxy calls
const BASE_URL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    : "";

export async function fetchFromProxy(path: string) {
  const url = `${BASE_URL}/api/youtube?path=${encodeURIComponent(path)}`;

  const res = await fetch(url, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    console.error("❌ Proxy fetch failed:", res.status, res.statusText);
    throw new Error(`YouTube fetch failed: ${res.status}`);
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

    // YouTube Music search for playlists
    const data = await fetchFromProxy(`/search?query=${query}&type=playlist&limit=${limit}`);
    let items: any[] = data?.result ?? [];

    items = items.filter((p) => p && p.browseId && p.title);

    if (sort === "alpha") {
      items.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "tracks") {
      items.sort((a, b) => (b.trackCount ?? 0) - (a.trackCount ?? 0));
    }

    console.log("YOUTUBE_PLAYLISTS", items);

    return items.map((p) => ({
      id: p.browseId,
      title: p.title,
      curator: p.author ?? "Unknown",
      image: p.thumbnails?.[0]?.url ?? "/placeholder.jpg",
      tracks: p.trackCount ?? 0,
    }));
  } catch (err) {
    console.error("YouTube fetchPlaylists error:", err);
    return [];
  }
}

/* ===========================================================
   🎧 PLAYLIST DETAILS
=========================================================== */

export interface YouTubeTrack {
  videoId: string;
  title: string;
  artist: string;
  album?: string;
  duration: string;
  thumbnail: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  curator: string;
  image: string;
  description?: string;
  genre?: string;
  tracks: YouTubeTrack[];
}

export async function fetchPlaylistById(id: string): Promise<YouTubePlaylist | null> {
  try {
    const data = await fetchFromProxy(`/playlist?browseId=${id}`);

    if (!data || !data.title) {
      console.error("❌ Invalid playlist data");
      return null;
    }

    const trackArray: any[] = Array.isArray(data.tracks) ? data.tracks : [];

    const tracks: YouTubeTrack[] = trackArray.map((t) => ({
      videoId: t.videoId,
      title: t.title,
      artist: t.artists?.[0]?.name ?? "Unknown",
      album: t.album?.name ?? "",
      duration: t.duration ?? "0:00",
      thumbnail: t.thumbnail?.[0]?.url ?? "/placeholder.jpg",
    }));

    return {
      id: data.browseId,
      title: data.title,
      curator: data.author ?? "Unknown",
      image: data.thumbnails?.[0]?.url ?? "/placeholder.jpg",
      description: data.description ?? "",
      genre: data.category ?? "Mixed",
      tracks,
    };
  } catch (err) {
    console.error("❌ YouTube fetchPlaylistById error:", err);
    return null;
  }
}

/* ===========================================================
   👨‍🎤 ARTIST DETAILS
=========================================================== */

export async function fetchArtistById(id: string) {
  try {
    const data = await fetchFromProxy(`/artist?browseId=${id}`);

    return {
      id: data.browseId,
      name: data.name,
      picture: data.thumbnails?.[0]?.url ?? "/placeholder.jpg",
      subscribers: data.subscribers ?? "Unknown",
      topSongs: data.topSongs ?? [],
    };
  } catch (err) {
    console.error("YouTube fetchArtistById error:", err);
    return null;
  }
}

/* ===========================================================
   💿 ALBUM DETAILS
=========================================================== */

export async function fetchAlbumById(id: string) {
  try {
    const data = await fetchFromProxy(`/album?browseId=${id}`);

    const tracks =
      data.tracks?.map((t: any) => ({
        videoId: t.videoId,
        title: t.title,
        duration: t.duration ?? "0:00",
        thumbnail: t.thumbnail?.[0]?.url ?? "/placeholder.jpg",
      })) ?? [];

    return {
      id: data.browseId,
      title: data.title,
      cover: data.thumbnails?.[0]?.url ?? "/placeholder.jpg",
      artist: data.artist?.name ?? "Unknown",
      genre: data.category ?? "Unknown",
      releaseDate: data.year ?? "Unknown",
      tracks,
    };
  } catch (err) {
    console.error("YouTube fetchAlbumById error:", err);
    return null;
  }
}

/* ===========================================================
   🔥 TRENDING / CHARTS
=========================================================== */

export async function fetchTrending() {
  try {
    const data = await fetchFromProxy(`/charts`);

    const tracks = data?.songs ?? [];
    const artists = data?.artists ?? [];
    const albums = data?.albums ?? [];

    return {
      topTracks: tracks.map((t: any) => ({
        videoId: t.videoId,
        title: t.title,
        artist: t.artist?.name,
        duration: t.duration,
        thumbnail: t.thumbnail?.[0]?.url,
      })),
      topArtists: artists.map((a: any) => ({
        id: a.browseId,
        name: a.name,
        picture: a.thumbnails?.[0]?.url,
      })),
      topAlbums: albums.map((a: any) => ({
        id: a.browseId,
        title: a.title,
        cover: a.thumbnails?.[0]?.url,
        artist: a.artist?.name,
      })),
    };
  } catch (err) {
    console.error("YouTube fetchTrending error:", err);
    return { topTracks: [], topArtists: [], topAlbums: [] };
  }
}
