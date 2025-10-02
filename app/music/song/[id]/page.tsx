import ClientPage from "./components/ClientPage";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getRelatedSongs } from "@/actions/getRelatedSongs";
import { getSongWithStats, incrementInteraction, SongSerialized } from "@/actions/getSongById";

interface SongDetailsPageProps {
  params: Promise<{ id: string }>; // ✅ params is async
}

export async function generateMetadata(
  { params }: SongDetailsPageProps
): Promise<Metadata> {
  try {
    const { id } = await params; // ✅ await params
    const song = await getSongWithStats(id);

    if (!song) {
      return { title: "Song not found" };
    }

    return {
      title: song.title,
      description: song.description || `${song.title} by ${song.artist}`,
      openGraph: {
        title: song.title,
        description: song.description || `${song.title} by ${song.artist}`,
        type: "music.song",
        images: song.coverUrl ? [{ url: song.coverUrl }] : undefined,
      },
    };
  } catch (error) {
    console.log("SONG_ERROR",error)
    return { title: "Song details" };
  }
}

export default async function SongDetailsPage(
  { params }: SongDetailsPageProps
) {
  try {
    const { id } = await params; // ✅ await params
    const media = await getSongWithStats(id);

    const relatedSongs = await getRelatedSongs(media?.genre as string, media?._id as string);

    if (!media) {
      notFound();
    }

    // Increment view count
    await incrementInteraction(id, "Song", "view");

    return <ClientPage data={media as SongSerialized} relatedSongs={relatedSongs} />;
  } catch (error) {
    console.log("[SongDetailsPage Error]", error);
    notFound();
  }
}
