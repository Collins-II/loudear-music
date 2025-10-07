import ClientPage from "./components/ClientPage";
import NetworkError from "@/components/NetworkError";
import { notFound } from "next/navigation";
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
    const media = await getSongWithStats(id);

    if (!media || !isBaseSerialized(media)) {
      notFound();
    }

    const relatedSongs = await getRelatedSongs(media?.genre as string, media?._id as string);

    await incrementInteraction(id, "Song", "view");

    return <ClientPage data={media as SongSerialized} relatedSongs={relatedSongs} />;
  } catch (error: any) {
    console.error("[SongDetailsPage Error]", error);

    // ✅ Detect MongoDB network issues gracefully
    if (
      error?.name === "MongoServerSelectionError" ||
      error?.message?.includes("ENOTFOUND") ||
      error?.message?.includes("failed to connect") ||
      error?.message?.includes("ServerSelectionTimeoutError")
    ) {
      return <NetworkError />;
    }

    notFound();
  }
}
