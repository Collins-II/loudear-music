"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image, { ImageLoaderProps } from "next/image";
import {
  Heart,
  //Share2,
  DownloadCloud,
  Flame,
  Eye,
} from "lucide-react";
import { getSocket } from "@/lib/socketClient";
import { SongSerialized } from "@/actions/getItemsWithStats";
import CustomPlayer from "@/components/music/CustomPlayer";
import { Badge } from "@/components/ui/badge";
import ShareModal from "@/components/modals/ShareModal";
import DownloadModal from "@/components/modals/DownloadModal";
import { timeAgo } from "@/lib/utils";
import HorizontalSlider from "@/components/sliders/HorizontalSlider";
import { SliderCard } from "@/components/sliders/SliderCard";
import Comments from "@/components/comments/Comments";
import ChartStatsCard from "@/components/charts/ChartStatsCard";
import SharePanel from "@/components/SharePanel";

/**
 * Design goals:
 * - Hero section with big cover, title, artist, badges
 * - Action row (like / share / download) with counts
 * - Sticky right column with social share tools and chart/trending info
 * - Player + description + related + comments
 */

interface ClientPageProps {
  data: SongSerialized;
  relatedSongs: SongSerialized[];
}


export default function ClientPage({ data, relatedSongs }: ClientPageProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const userId = session?.user?.id;

  // local UI state
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(data.likeCount ?? 0);
  const [shareCount, setShareCount] = useState<number>(data.shareCount ?? 0);
  const [downloadCount, setDownloadCount] = useState<number>(
    data.downloadCount ?? 0
  );
  const [imgError, setImgError] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  // socket: synchronize live counts and userLiked state
  useEffect(() => {
    if (!data?._id) return;
    const socket = getSocket();
    socket.emit("join", data._id);

    const onInteraction = (payload: any) => {
      // payload may vary; we check for itemId or id
      const itemId = payload.itemId ?? payload.id;
      if (!itemId || itemId !== data._id) return;

      if (payload.counts) {
        setLikeCount(payload.counts.likes ?? ((c) => c));
        setShareCount(payload.counts.shares ?? ((c) => c));
        setDownloadCount(payload.counts.downloads ?? ((c) => c));
      }

      if (typeof payload.userLiked !== "undefined") {
        setLiked(Boolean(payload.userLiked));
      }
    };

    socket.on("interaction:update", onInteraction);

    return () => {
      socket.off("interaction:update", onInteraction);
    };
  }, [data?._id]);

  const handleInteraction = useCallback(
    async (type: "like" | "share" | "download") => {
      if (!userId) {
        // you can replace with a nicer UI prompt / modal when not authenticated
        return alert("Please sign in to interact.");
      }
      try {
        // optimistic UI for likes (toggle)
        if (type === "like") {
          setLiked((v) => !v);
          setLikeCount((n) => (liked ? Math.max(0, n - 1) : n + 1));
        } else if (type === "download") {
          setDownloadCount((n) => n + 1);
        }

        await fetch(`/api/interactions/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: data._id, model: "Song", userId }),
        });
      } catch (err) {
        console.error("Interaction error", err);
      }
    },
    [data?._id, userId, liked]
  );

  // share helpers
  const pageUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/music/song/${data._id}`;

  /*const handleNativeShare = async () => {
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({
          title: data.title,
          text: data.description ?? `${data.title} — ${data.artist}`,
          url: pageUrl,
        });
        await handleInteraction("share");
      } catch (err) {
        // sharing canceled or failed
        console.debug("Native share canceled/failed", err);
      }
    } else {
      setShareOpen(true);
    }
  };*/

  // image loader
  const customImageLoader = ({ src, width, quality }: ImageLoaderProps) => {
    try {
      const url = new URL(src);
      if (url.hostname.includes("res.cloudinary.com")) {
        return `${src}?w=${width}&q=${quality || 80}&f=auto`;
      }
      return src;
    } catch {
      return src;
    }
  };

  return (
    <main className="bg-white dark:bg-black text-gray-900 dark:text-gray-100 py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* HERO + MAIN: cols 1-8 */}
        <section className="lg:col-span-8 space-y-8">
          {/* Hero */}
          <div className="bg-white dark:bg-neutral-900 dark:border-white/5 overflow-hidden">
            <div className="md:flex items-center gap-6 py-6 ">
              {/* Cover */}
              <div className="w-full md:w-80 flex-shrink-0">
                <div className="relative w-full h-80 rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-800">
                  <Image
                    src={
                      !imgError && data.coverUrl
                        ? data.coverUrl
                        : "/assets/images/placeholder_cover.jpg"
                    }
                    alt={data.title}
                    fill
                    loader={customImageLoader}
                    className="object-cover"
                    onError={() => setImgError(true)}
                    priority
                  />

                  {/* Trending badge */}
                  {data.trendingPosition && data.trendingPosition <= 10 && (
                    <div className="absolute left-3 top-3 flex items-center gap-2 bg-gradient-to-r from-pink-600 to-orange-400 px-3 py-1 rounded-full text-xs font-semibold text-white shadow">
                      <Flame size={14} /> HOT
                    </div>
                  )}

                  {/* Chart rank */}
                  {typeof data.chartPosition === "number" && (
                    <div className="absolute right-3 top-3 px-3 py-1 rounded-full bg-black/80 text-white text-sm font-bold">
                      #{data.chartPosition}
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="mt-4 md:mt-0 flex-1">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  {data.title}
                </h1>

                <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      By <span className="font-semibold text-black dark:text-white">{data.artist}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {data.genre} • <span className="text-xs text-gray-500">{timeAgo(data.createdAt)}</span>
                    </p>
                  </div>

                  <div className="mt-3 sm:mt-0 flex items-center gap-2">
                    <Badge className="uppercase px-3 py-1 text-xs">Single</Badge>
                  </div>
                </div>

                {/* Stats + actions */}
                <div className="mt-6 flex items-center gap-4 flex-wrap">
                  {/* Stats row */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{data.viewCount ?? 0}</span>
                      <span className="text-xs text-gray-400">plays</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{likeCount}</span>
                      <span className="text-xs text-gray-400">likes</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <DownloadCloud className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{downloadCount}</span>
                      <span className="text-xs text-gray-400">downloads</span>
                    </div>

                  </div>

                  {/* Action buttons 
                  <div className="flex flex-wrap items-center gap-3">
                   <button
                      type="button"
                      aria-label={liked ? "Unlike" : "Like"}
                      onClick={() => handleInteraction("like")}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                        liked
                          ? "bg-red-50 border-red-200 text-red-600"
                          : "bg-white dark:bg-neutral-800 border-black/5 dark:border-white/5 text-gray-700 dark:text-gray-200"
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400`}
                    >
                      <Heart
                        className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : "text-gray-500"}`}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium">{liked ? "Liked" : "Like"}</span>
                    </button>


                    <button
                      onClick={handleNativeShare}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-black text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Share</span>
                    </button>

                    <button
                      onClick={() => { setDownloadOpen(true); handleInteraction("download"); }}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white dark:bg-neutral-800 border-black/5 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
                    >
                      <DownloadCloud className="w-4 h-4" />
                      <span className="text-sm font-medium">Download</span>
                    </button>
                  </div>*/}
                </div>
              </div>
            </div>
          </div>

          {/* Player */}
            <CustomPlayer
              src={data.fileUrl}
              title={data.title}
              artist={data.artist}
              coverUrl={data.coverUrl}
              onDownload={() => {
                setDownloadOpen(true);
                handleInteraction("download");
              }}
            />

          {/* Description / Article */}
          {data.description && (
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <h3 className="mt-6 text-2xl md:text-3xl font-extrabold">About the track</h3>
            <p>
              {data.description ??
                "No description available. This page displays metadata, stats and community comments for the release."}
            </p>
          </article>
        )}

          {/* Related songs */}
          {relatedSongs?.length > 0 && (
            <div className="mt-6">
              <HorizontalSlider title="You might also like" className="">
                {relatedSongs.map((song) => (
                  <SliderCard
                    key={song._id}
                    id={song._id}
                    title={song.title}
                    artist={song.artist}
                    cover={song.coverUrl}
                    downloads={song.downloadCount}
                    publishedAt={song.releaseDate as string}
                    genre={song.genre}
                    views={song.viewCount}
                    href={`/music/song/${song._id}`}
                  />
                ))}
              </HorizontalSlider>
            </div>
          )}

          {/* Comments */}
          <div className="mt-8">
            <Comments model="Song" id={data._id} initialComments={data.latestComments} user={user} />
          </div>
        </section>

        {/* STICKY SIDEBAR: cols 9-12 */}
        <aside className="lg:col-span-4">
          <div className="sticky top-20 space-y-6">
            {/* Share panel */}
            <SharePanel
              title={data.title}
              artist={data.artist}
              shareCount={shareCount}
              onShare={() => handleInteraction("share")}
            />

            <ChartStatsCard
              data={{
                trendingPosition: data.trendingPosition,
                chartPosition: data.chartPosition,
                peak: data.chartHistory?.[0]?.peak,
                plays: data.viewCount,
                likes: likeCount,
                shares: shareCount,
                downloads: downloadCount,
              }}
            />

            {/* CTA / Ads placeholder */}
            <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white text-center">
              <h5 className="font-bold">Promote your release</h5>
              <p className="text-sm mt-1">Reach thousands of listeners with our featured campaigns.</p>
              <button className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-md">Learn more</button>
            </div>
          </div>
        </aside>
      </div>

      {/* Modals */}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shareUrl={pageUrl}
        title={data.title}
      />
      <DownloadModal
        data={data}
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        fileUrl={data.fileUrl}
        onConfirmDownload={() => handleInteraction("download")}
      />
    </main>
  );
}
