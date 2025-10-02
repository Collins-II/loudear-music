import ClientPage from "./components/ClientPage";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { AlbumSerialized, getAlbumWithStats, incrementInteraction } from "@/actions/getSongById";
import { getRelatedSongs } from "@/actions/getRelatedSongs";

interface SongDetailsPageProps {
  params: Promise<{ id: string }>; // ✅ params is async
}

export async function generateMetadata(
  { params }: SongDetailsPageProps
): Promise<Metadata> {
  try {
    const { id } = await params; // ✅ await params
    const album = await getAlbumWithStats(id);

    if (!album) {
      return { title: "Album not found" };
    }

    return {
      title: album.title,
      description: album.description || `${album.title} by ${album.artist}`,
      openGraph: {
        title: album.title,
        description: album.description || `${album.title} by ${album.artist}`,
        type: "music.song",
        images: album.coverUrl ? [{ url: album.coverUrl }] : undefined,
      },
    };
  } catch (error) {
    return { title: "Song details" };
  }
}

export default async function AlbumDetailsPage(
  { params }: SongDetailsPageProps
) {
  try {
    const { id } = await params; // ✅ await params
    const media = await getAlbumWithStats(id);
    const relatedSongs = await getRelatedSongs(media?.genre as string, media?._id as string);

    if (!media) {
      notFound();
    }

    console.log("ALBUM_DATA", media)

    // Increment view count
    await incrementInteraction(id, "Album", "view");

    return <ClientPage data={media as AlbumSerialized} relatedSongs={relatedSongs}/>;
  } catch (error) {
    console.log("[SongDetailsPage Error]", error);
    notFound();
  }
}
