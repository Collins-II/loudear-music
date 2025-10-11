// app/albums/[id]/page.tsx
import ClientPage from "./components/ClientPage";
import { Metadata } from "next";
import {
  getAlbumWithStats,
  incrementInteraction,
  AlbumSerialized,
} from "@/actions/getItemsWithStats";
import NetworkError from "@/components/NetworkError";
import { getRelatedAlbums } from "@/actions/getRelatedAlbums";

interface AlbumDetailsPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Type guard to ensure we have a serialized item (Song/Album/Video)
 * and not just the internal-only object.
 */
function isBaseSerialized(obj: any): obj is { title: string; artist: string; genre?: string; _id: string } {
  return !!obj && typeof obj === "object" && typeof obj.title === "string" && typeof obj.artist === "string" && !!obj._id;
}

/* ------------------------------------------------------------------
 * Metadata
 * ------------------------------------------------------------------ */
export async function generateMetadata({ params }: AlbumDetailsPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const album = await getAlbumWithStats(id);

    // Narrow / guard
    if (!album || !isBaseSerialized(album)) {
      return { title: "Album not found" };
    }

    return {
      title: album.title,
      description: album.description || `${album.title} by ${album.artist}`,
      openGraph: {
        title: album.title,
        description: album.description || `${album.title} by ${album.artist}`,
        type: "music.album",
        images: album.coverUrl ? [{ url: album.coverUrl }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: album.title,
        description: album.description || `${album.title} by ${album.artist}`,
        images: album.coverUrl ? [album.coverUrl] : [],
      },
    };
  } catch (error: any) {
    console.error("ALBUM_METADATA_ERROR", error);
    return { title: "Album details" };
  }
}

/* ------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------ */
export default async function AlbumDetailsPage({ params }: AlbumDetailsPageProps) {
  try {
    const { id } = await params;
    const media = await getAlbumWithStats(id);

    // Narrow / guard: if media is null or missing serialized fields, treat as not found
     if (!media) {
          return <NetworkError message="Unable to fetch this album. Please try again." />;
     }

    // At this point TypeScript knows `media` has title/artist/_id fields.
    // We can cast to AlbumSerialized safely if we want more specificity.
    const album = media as AlbumSerialized;

    // Related songs: only call when genre and _id are available
    const relatedSongs = await getRelatedAlbums(album.genre, album._id as string);

    // Increment view count (server-side)
    await incrementInteraction(id, "Album", "view");

    return <ClientPage data={album} relatedSongs={relatedSongs} />;
} catch (error: any) {
  console.error("[SongDetailsPage Error]", error);
  return <NetworkError message="Something went wrong loading the album." />;
}
}
