import BeatClientPage from "./components/ClientPage";
import NetworkError from "@/components/NetworkError";
import { Metadata } from "next";

import {
  getBeatWithStats,
  incrementInteraction,
  BeatSerialized,
} from "@/actions/getItemsWithStats";
import { getRelatedBeats } from "@/actions/getRelatedBeats"; // rename later if needed
import { isBaseSerialized } from "@/lib/utils";

interface BeatDetailsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: BeatDetailsPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const beat = await getBeatWithStats(id);

    if (!beat || !isBaseSerialized(beat)) {
      return { title: "Beat not found" };
    }

    return {
      title: `${beat.title} - ${beat.producer}`,
      description:
        beat.description || `${beat.title} produced by ${beat.producer}`,

      openGraph: {
        title: `${beat.title} - ${beat.producer}`,
        description:
          beat.description || `${beat.title} produced by ${beat.producer}`,
        type: "music.song",
        images: beat.coverUrl ? [{ url: beat.coverUrl }] : undefined,
      },

      twitter: {
        card: "summary_large_image",
        title: beat.title,
        description:
          beat.description || `${beat.title} produced by ${beat.producer}`,
        images: beat.coverUrl ? [beat.coverUrl] : [],
      },
    };
  } catch (error) {
    console.error("BEAT_METADATA_ERROR", error);
    return { title: "Beat Details" };
  }
}

export default async function BeatDetailsPage({
  params,
}: BeatDetailsPageProps) {
  try {
    const { id } = await params;

    // count a view
    await incrementInteraction(id, "Beat", "view");

    const beat = await getBeatWithStats(id);
    if (!beat) {
      return (
        <NetworkError message="Unable to fetch this beat. Please try again." />
      );
    }

    const related = await getRelatedBeats(
      beat.genre as string,
      beat._id as string,
    );

    return (
      <BeatClientPage
        data={beat as BeatSerialized}
        relatedBeats={related}
      />
    );
  } catch (error) {
    console.error("[BeatDetailsPage Error]", error);
    return (
      <NetworkError message="Something went wrong loading this beat." />
    );
  }
}
