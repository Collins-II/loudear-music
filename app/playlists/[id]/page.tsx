// app/playlists/[id]/page.tsx
import { fetchPlaylistById, fetchPlaylists } from "@/lib/spotify";
import PlaylistDetailsClient from "./components/PlaylistDetailsClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PlaylistPage({ params }: Props) {
  const { id } = await params; // ✅ unwrap with use/await
  const playlist = await fetchPlaylistById(id);

  // preload related playlists on the server if you want
  const related = playlist.genre
    ? await fetchPlaylists(playlist.genre, "10")
    : [];

  return (
    <PlaylistDetailsClient
      playlist={playlist}
      relatedPlaylist={related}
    />
  );
}
