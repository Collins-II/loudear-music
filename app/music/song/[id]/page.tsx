import ClientPage from "./components/ClientPage";
import NetworkError from "@/components/NetworkError";
import { Metadata } from "next";
import { getRelatedSongs } from "@/actions/getRelatedSongs";
import { getSongWithStats, incrementInteraction, SongSerialized } from "@/actions/getItemsWithStats";
import { isBaseSerialized } from "@/lib/utils";

interface SongDetailsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: SongDetailsPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const song = await getSongWithStats(id);

    if (!song || !isBaseSerialized(song)) {
      return { title: "Song not found" };
    }

    return {
      title: `${song.title} - ${song.artist}`,
      description: song.description || `${song.title} by ${song.artist}`,
      openGraph: {
        title: `${song.title} - ${song.artist}`,
        description: song.description || `${song.title} by ${song.artist}`,
        type: "music.song",
        images: song.coverUrl ? [{ url: song.coverUrl }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: song.title,
        description: song.description || `${song.title} by ${song.artist}`,
        images: song.coverUrl ? [song.coverUrl] : [],
      },
    };
  } catch (error: any) {
    console.error("SONG_METADATA_ERROR", error);
    return { title: "Song Details" };
  }
}

export default async function SongDetailsPage({ params }: SongDetailsPageProps) {
  try {
    const { id } = await params;
     await incrementInteraction(id, "Song", "view");
    const media = await getSongWithStats(id);

    // Show NetworkError or fallback UI instead of breaking the app
    if (!media) {
      return <NetworkError message="Unable to fetch this song. Please try again." />;
    }

    const relatedSongs = await getRelatedSongs(media?.genre as string, media?._id as string);

    return <ClientPage data={media as SongSerialized} relatedSongs={relatedSongs} />;
  } catch (error: any) {
    console.error("[SongDetailsPage Error]", error);
    return <NetworkError message="Something went wrong loading the song." />;
  }
}
