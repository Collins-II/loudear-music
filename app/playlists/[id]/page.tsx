// app/playlists/[id]/page.tsx
import { DeezerPlaylist, fetchPlaylistById, fetchPlaylists } from "@/lib/youtube";
import PlaylistDetailsClient from "./components/PlaylistDetailsClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PlaylistPage({ params }: Props) {
  const { id } = await params;
  const playlist = await fetchPlaylistById(id);

  if (!playlist) {
    // ✅ Graceful handling when playlist is not found
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Playlist not found
        </h2>
        <p className="text-gray-500 mt-2">
          The playlist you’re looking for doesn’t exist or has been removed.
        </p>
      </div>
    );
  }

  const related =
    playlist.genre ? await fetchPlaylists(playlist.genre, "10") : [];

  return (
    <PlaylistDetailsClient
      playlist={playlist as DeezerPlaylist}
      relatedPlaylist={related}
    />
  );
}
