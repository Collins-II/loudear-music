import { getVideoById } from "@/actions/getVideosById";
import ClientPage from "./components/ClientPage";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getVideoWithStats, incrementInteraction, VideoSerialized } from "@/actions/getSongById";
import { getRelatedVideos } from "@/actions/getRelatedVideos";

interface SongDetailsPageProps {
  params: Promise<{ id: string }>; // ✅ params is async
}

export async function generateMetadata(
  { params }: SongDetailsPageProps
): Promise<Metadata> {
  try {
    const { id } = await params; // ✅ await params
    const song = await getVideoWithStats(id);

    if (!song) {
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
    return { title: "Video details" };
  }
}

export default async function VideoDetailsPage(
  { params }: SongDetailsPageProps
) {
  try {
    const { id } = await params; // ✅ await params
    const media = await getVideoWithStats(id);
    const vids = await getRelatedVideos(media?.genre as string, media?._id as string);
    console.log("VIDEOS_DATA",media)

    if (!media) {
      notFound();
    }

    // Increment view count
    await incrementInteraction(id, "Video", "view");

    return <ClientPage data={media as VideoSerialized} relatedVideos={vids} />;
  } catch (error) {
    console.log("[SongDetailsPage Error]", error);
    notFound();
  }
}
