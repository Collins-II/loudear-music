"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image, { ImageLoaderProps } from "next/image";
import {
  Heart,
  Share2,
  DownloadCloud,
  Flame,
  Copy,
  Twitter,
  Eye,
} from "lucide-react";
import { getSocket } from "@/lib/socketClient";
import { AlbumSerialized, SongSerialized } from "@/actions/getItemsWithStats";
import AlbumPlayer from "@/components/music/AlbumPlayer";
import { Badge } from "@/components/ui/badge";
import ShareModal from "@/components/modals/ShareModal";
import { formatDate, timeAgo } from "@/lib/utils";
import HorizontalSlider from "@/components/sliders/HorizontalSlider";
import { SliderCard } from "@/components/sliders/SliderCard";
import Comments from "@/components/comments/Comments";
import { toast } from "sonner";

interface AlbumClientPageProps {
  data: AlbumSerialized;
  relatedSongs: SongSerialized[];
}

export default function AlbumClientPage({
  data,
  relatedSongs,
}: AlbumClientPageProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const userId = session?.user?.id;

  // UI state
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(data.likeCount ?? 0);
  const [shareCount, setShareCount] = useState<number>(data.shareCount ?? 0);
  const [downloadCount, setDownloadCount] = useState<number>(
    data.downloadCount ?? 0
  );
  const [imgError, setImgError] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Socket sync
  useEffect(() => {
    if (!data?._id) return;
    const socket = getSocket();
    socket.emit("join", data._id);

    const onInteraction = (payload: any) => {
      const itemId = payload.itemId ?? payload.id;
      if (!itemId || itemId !== data._id) return;

      if (payload.counts) {
        // ensure numeric values (fallback to existing)
        setLikeCount(typeof payload.counts.likes === "number" ? payload.counts.likes : ((c:any) => c) as any);
        setShareCount(typeof payload.counts.shares === "number" ? payload.counts.shares : ((c:any) => c) as any);
        setDownloadCount(typeof payload.counts.downloads === "number" ? payload.counts.downloads : ((c:any) => c) as any);
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

  // Optimistic interaction handler
  const handleInteraction = useCallback(
    async (type: "like" | "share" | "download") => {
      if (!userId) {
        return alert("Please sign in to interact.");
      }

      try {
        if (type === "like") {
          // toggle locally (optimistic)
          setLiked((v) => !v);
          setLikeCount((n) => (liked ? Math.max(0, n - 1) : n + 1));
        } else if (type === "share") {
          setShareCount((n) => n + 1);
        } else if (type === "download") {
          setDownloadCount((n) => n + 1);
        }

        await fetch(`/api/interactions/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: data._id, model: "Album", userId }),
        });
      } catch (err) {
        console.error("Interaction error", err);
      }
    },
    [data?._id, userId, liked]
  );

  // Sharing helpers
  const pageUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/music/album/${data._id}`;

  const handleNativeShare = async () => {
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({
          title: data.title,
          text: data.description ?? `${data.title} — ${data.artist}`,
          url: pageUrl,
        });
        await handleInteraction("share");
      } catch (err) {
        console.debug("Native share canceled/failed", err);
      }
    } else {
      setShareOpen(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      if (typeof toast === "function") toast.success("Link copied to clipboard");
      else alert("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2400);
      await handleInteraction("share");
    } catch (err) {
      console.error("Copy failed", err);
      if (typeof toast === "function") toast.error("Could not copy link");
      else alert("Could not copy link");
    }
  };

  // image loader (cloudinary-friendly)
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
        {/* MAIN */}
        <section className="lg:col-span-8 space-y-8">
          {/* Hero */}
          <div className="bg-white dark:bg-neutral-900 border-b-[4px] border-black dark:border-white/5 overflow-hidden">
            <div className="md:flex items-center gap-6 p-6 md:p-8">
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

                  {/* Trending badge (if present) */}
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

              {/* Meta */}
              <div className="mt-4 md:mt-0 flex-1">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  {data.title}
                </h1>

                <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      By{" "}
                      <span className="font-semibold text-black dark:text-white">
                        {data.artist}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {data.genre} • Released {formatDate(data.createdAt)}
                    </p>
                  </div>

                  <div className="mt-3 sm:mt-0 flex items-center gap-2">
                    <Badge className="uppercase px-3 py-1 text-xs">Album</Badge>
                    <span className="text-xs text-gray-500">{timeAgo(data.createdAt)}</span>
                  </div>
                </div>

                {/* Stats & actions */}
                <div className="mt-6 flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
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

                  <div className="flex items-center gap-3">
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
                      type="button"
                      onClick={handleNativeShare}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-black text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Share</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { handleInteraction("download"); }}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white dark:bg-neutral-800 border-black/5 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
                    >
                      <DownloadCloud className="w-4 h-4" />
                      <span className="text-sm font-medium">Download</span>
                    </button>
                  </div>
                </div>

                {/* short desc */}
                {data.description && (
                  <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                    {data.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Player (AlbumPlayer) */}
          <div className="rounded-lg bg-white dark:bg-neutral-900 p-4 md:p-6 border-b-[3px] border-black/10 dark:border-white/5">
            <AlbumPlayer
              userId={userId}
              tracks={(data.songs ?? []) as SongSerialized[]}
              albumTitle={data.title}
              albumArtist={data.artist}
              coverUrl={data.coverUrl}
            />
          </div>

          {/* About / Article */}
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="mt-6 text-2xl font-bold">About the album</h2>
            <p>
              {data.description ??
                "No description available. This page displays metadata, stats and community comments for the release."}
            </p>
          </article>

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
                    publishedAt={(song.releaseDate ?? song.createdAt) as string}
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
            <Comments model="Album" id={data._id} initialComments={data.latestComments} user={user} />
          </div>
        </section>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4">
          <div className="sticky top-20 space-y-6">
            {/* Share panel */}
            <div className="rounded-lg bg-white dark:bg-neutral-900 p-4 border-b-[2px] border-black/5 dark:border-white/5 shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <h4 className="text-sm font-semibold">Share this album</h4>
                {shareCount > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-black/80 font-light">{shareCount}</span>
                    <span className="text-xs text-gray-400">shares</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-black text-white"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md border"
                  aria-label="Copy link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${data.title} — ${data.artist}`)}&url=${encodeURIComponent(pageUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md border"
                >
                  <Twitter className="w-4 h-4" /> Twitter
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md border"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H8.9v-3h1.5V9.3c0-1.5.9-2.4 2.3-2.4.7 0 1.4.1 1.4.1v1.6h-.8c-.8 0-1 0-1 1v1.2h1.8l-.3 3h-1.5v7A10 10 0 0 0 22 12z"/></svg>
                  Facebook
                </a>
              </div>

              {copied && <div className="mt-3 text-sm text-green-600">Link copied to clipboard</div>}
            </div>

            {/* Chart & meta */}
            <div className="rounded-lg bg-white dark:bg-neutral-900 p-4 border-b-[2px] border-black/5 dark:border-white/5 shadow-sm">
              <h4 className="text-sm font-semibold mb-3">Chart & stats</h4>

              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <div className="flex justify-between">
                  <span>Trending position</span>
                  <span className="font-semibold">{data.trendingPosition ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Chart this week</span>
                  <span className="font-semibold">{data.chartPosition ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Peak</span>
                  <span className="font-semibold">{data.chartHistory?.[0]?.peak ?? "—"}</span>
                </div>
              </div>
            </div>

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
      {/*<DownloadModal
        data={data}
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        fileUrl={""}
        onConfirmDownload={() => handleInteraction("download")}
      />*/}
    </main>
  );
}
