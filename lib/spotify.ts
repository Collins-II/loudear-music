const SPOTIFY_CLIENT_ID = "a34552c908784562b09af6253ae2cb66"
const SPOTIFY_CLIENT_SECRET = "2533f4c3938641c0b7abd042fc4c92ea"

let cachedToken: string | null = null;
let tokenExpiry = 0;

export async function getAccessToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && now < tokenExpiry) return cachedToken;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
          "base64"
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const err = await res.json();
    console.log("Spotify token error:", err);
    throw new Error("Failed to get Spotify access token");
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = now + data.expires_in * 1000 - 60000; // refresh 1min early

  return cachedToken as string;
}

export async function fetchPlaylists(
  mood: string = "All",
  region: string = "global",
  sort: string = "relevance",
  limit: number = 20
) {
  try {
    const token = await getAccessToken();

    // Build query dynamically
    let query = mood !== "All" ? `${mood} playlists` : "playlists";

    if (region && region !== "global") {
      query += ` ${region}`;
    }

    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error("Spotify search error:", err);
      return [];
    }

    const data = await res.json();
    let items: any[] = data?.playlists?.items ?? [];

    // ✅ Filter playlists
    items = items.filter(
      (p) => p && p.id && p.name && (p.tracks?.total ?? 0) > 0
    );

    // ✅ Sorting logic
    if (sort === "tracks") {
      items.sort((a, b) => (b.tracks?.total ?? 0) - (a.tracks?.total ?? 0));
    } else if (sort === "alpha") {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "recent") {
      items.sort(
        (a, b) =>
          new Date(b?.snapshot_id?.timestamp ?? 0).getTime() -
          new Date(a?.snapshot_id?.timestamp ?? 0).getTime()
      );
    }

    return items.map((p) => ({
      id: p.id,
      title: p.name,
      curator: p.owner?.display_name ?? "Unknown",
      image: p.images?.[0]?.url ?? "/placeholder.jpg",
      tracks: p.tracks?.total ?? 0,
    }));
  } catch (err) {
    console.error("Spotify fetchPlaylists error:", err);
    return [];
  }
}



export async function fetchPlaylistById(id: string) {
  try {
    const token = await getAccessToken();

    const res = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store", // ensure fresh fetch
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Spotify playlist fetch error:", err);
      throw new Error("Failed to fetch playlist by ID");
    }

    const data = await res.json();

    // try to guess mood/genre from description or name
    let inferredMood: string | null = null;
    const possibleMoodSources = `${data.name} ${data.description}`.toLowerCase();

    if (possibleMoodSources.includes("chill")) inferredMood = "Chill";
    else if (possibleMoodSources.includes("rap")) inferredMood = "Rap / Hip-Hop";
    else if (possibleMoodSources.includes("party")) inferredMood = "Party";
    else if (possibleMoodSources.includes("focus")) inferredMood = "Focus";
    else if (possibleMoodSources.includes("love")) inferredMood = "Love / Romantic";
    else if (possibleMoodSources.includes("workout")) inferredMood = "Workout";
    else inferredMood = "Mixed";

    const tracks =
      data.tracks?.items?.map((t: any) => ({
        id: t.track?.id ?? t.id,
        title: t.track?.name ?? t.name,
        artist: t.track?.artists?.map((a: any) => a.name).join(", ") ?? "Unknown",
        album: t.track?.album?.name ?? "Unknown",
        duration: t.track?.duration_ms
          ? `${Math.floor(t.track.duration_ms / 60000)}:${Math.floor(
              (t.track.duration_ms % 60000) / 1000
            )
              .toString()
              .padStart(2, "0")}`
          : "0:00",
        uri: t.track?.uri,
      })) ?? [];

    return {
      id: data.id,
      title: data.name,
      curator: data.owner?.display_name ?? "Unknown",
      image: data.images?.[0]?.url ?? "/placeholder.jpg",
      description: data.description ?? "",
      genre: inferredMood, // ✅ new field
      tracks,
      accessToken: token,
    };
  } catch (err) {
    console.error("Spotify fetchPlaylistById error:", err);
    return {
      id,
      title: "Unknown Playlist",
      curator: "Unknown",
      image: "/placeholder.jpg",
      description: "",
      genre: "Unknown",
      tracks: [],
    };
  }
}