
import ClientPage from "./components/ClientPage";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getVideoWithStats, incrementInteraction, VideoSerialized } from "@/actions/getItemsWithStats";
import { getRelatedVideos } from "@/actions/getRelatedVideos";
import { isBaseSerialized } from "@/lib/utils";

interface SongDetailsPageProps {
  params: Promise<{ id: string }>; // ✅ params is async
}

export async function generateMetadata(
  { params }: SongDetailsPageProps
): Promise<Metadata> {
  try {
    const { id } = await params; // ✅ await params
    const song = await getVideoWithStats(id);

    if (!song || !isBaseSerialized(song)) {
      return { title: "Video not found" };
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
    console.log("VIDEO_ERR",error)
    return { title: "Video details" };
  }
}

export default async function VideoDetailsPage(
  { params }: SongDetailsPageProps
) {
  try {
    const { id } = await params; // ✅ await params
    const media = await getVideoWithStats(id);

    if (!media || !isBaseSerialized(media)) {
      notFound();
    }

    const vids = await getRelatedVideos(media?.genre as string, media?._id as string);

    // Increment view count
    await incrementInteraction(id, "Video", "view");

    return <ClientPage data={media as VideoSerialized} relatedVideos={vids} />;
  } catch (error) {
    console.log("[SongDetailsPage Error]", error);
    notFound();
  }
}
