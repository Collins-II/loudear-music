"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image, { ImageLoaderProps } from "next/image";
import {
  Heart,
  Share2,
  DownloadCloud,
  Flame,
  Eye,
} from "lucide-react";
import { getSocket } from "@/lib/socketClient";
import { VideoSerialized, incrementInteraction } from "@/actions/getItemsWithStats";
import { timeAgo } from "@/lib/utils";
import ShareModal from "@/components/modals/ShareModal";
import DownloadModal from "@/components/modals/DownloadModal";
import VideoPlayer from "@/components/video/VideoPlayer";
import HorizontalSlider from "@/components/sliders/HorizontalSlider";
import { SliderCard } from "@/components/sliders/SliderCard";
import Comments from "@/components/comments/Comments";
import { Badge } from "@/components/ui/badge";
import ChartStatsCard from "@/components/charts/ChartStatsCard";
import SharePanel from "@/components/SharePanel";

interface VideoPageProps {
  data: VideoSerialized;
  relatedVideos: VideoSerialized[];
}

export default function VideoPage({ data, relatedVideos }: VideoPageProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const userId = user?.id;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(data.likeCount ?? 0);
  const [shareCount, setShareCount] = useState(data.shareCount ?? 0);
  const [downloadCount, setDownloadCount] = useState(data.downloadCount ?? 0);
  const [imgError, setImgError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const pageUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/videos/${data._id}`;

  // ✅ Socket updates
  useEffect(() => {
    if (!data?._id) return;
    const socket = getSocket();
    const room = `Video:${data._id}`;
    socket.emit("join", room);

    const onInteraction = (payload: any) => {
      if (payload.itemId !== data._id || payload.model !== "Video") return;
      if (payload.counts) {
        setLikeCount(payload.counts.likes ?? likeCount);
        setShareCount(payload.counts.shares ?? shareCount);
        setDownloadCount(payload.counts.downloads ?? downloadCount);
      }
      if (typeof payload.userLiked !== "undefined") setLiked(Boolean(payload.userLiked));
    };

    socket.on("interaction:update", onInteraction);
    return () => {
      socket.emit("leave", room);
      socket.off("interaction:update", onInteraction);
    };
  }, [data?._id, likeCount, shareCount, downloadCount]);

  // ✅ Interactions
  const handleInteraction = useCallback(
    async (type: "like" | "share" | "download") => {
      if (!userId) return alert("Please sign in to interact.");
      try {
        if (type === "like") {
          setLiked((v) => !v);
          setLikeCount((n) => (liked ? Math.max(0, n - 1) : n + 1));
        } else if (type === "share") setShareCount((n) => n + 1);
        else if (type === "download") setDownloadCount((n) => n + 1);

        await incrementInteraction(data._id, "Video", type, userId);
      } catch (err) {
        console.error(err);
      }
    },
    [data._id, userId, liked]
  );

  // ✅ Download logic
  const handleDownload = async () => {
    if (!data.fileUrl) return;
    setDownloading(true);
    try {
      const response = await fetch(data.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.artist} - ${data.title}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      await handleInteraction("download");
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  // ✅ Native share
  const handleNativeShare = async () => {
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({
          title: data.title,
          text: `${data.title} — ${data.artist}`,
          url: pageUrl,
        });
        await handleInteraction("share");
      } catch {}
    } else setShareOpen(true);
  };

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

        {/* MAIN CONTENT */}
        <section className="lg:col-span-8 space-y-8">

          {/* Hero Section */}
          <div className="bg-white dark:bg-neutral-900 border-b-[4px] border-black dark:border-white/5 overflow-hidden">
            <div className="md:flex items-center gap-6 py-6">
              {/* Thumbnail */}
              <div className="w-full md:w-80 flex-shrink-0">
                <div className="relative w-full h-80 rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-800">
                  <Image
                    src={!imgError && data.coverUrl ? data.coverUrl : "/assets/images/placeholder_cover.jpg"}
                    alt={data.title}
                    fill
                    loader={customImageLoader}
                    className="object-cover"
                    onError={() => setImgError(true)}
                    priority
                  />
                  {data.trendingPosition && data.trendingPosition <= 10 && (
                    <div className="absolute left-3 top-3 flex items-center gap-2 bg-gradient-to-r from-pink-600 to-orange-400 px-3 py-1 rounded-full text-xs font-semibold text-white shadow">
                      <Flame size={14} /> HOT
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
                  <div className="mt-3 sm:mt-0">
                    <Badge className="uppercase px-3 py-1 text-xs">Video</Badge>
                  </div>
                </div>

                {/* Stats and Actions */}
                <div className="mt-6 flex items-center gap-4 flex-wrap">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{data.viewCount ?? 0}</span>
                      <span className="text-xs text-gray-400">views</span>
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

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleInteraction("like")}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                        liked
                          ? "bg-red-50 border-red-200 text-red-600"
                          : "bg-white dark:bg-neutral-800 border-black/5 dark:border-white/5 text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                      <span className="text-sm font-medium">{liked ? "Liked" : "Like"}</span>
                    </button>

                    <button
                      onClick={handleNativeShare}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-black text-white"
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </button>

                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white dark:bg-neutral-800 border-black/5 dark:border-white/5"
                    >
                      <DownloadCloud className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {downloading ? "Downloading..." : "Download"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="bg-white dark:bg-neutral-900 border-b-[4px] border-black dark:border-white/5 pb-4">
            <VideoPlayer
              id={data._id}
              userId={userId}
              src={data.fileUrl}
              title={data.title}
              thumbnail={data.coverUrl}
              initialShares={data.shareCount}
              initialLikes={data.likeCount}
              initialViews={data.viewCount}
            />
          </div>

          {/* Description */}
          {data.description && (
            <article className="prose prose-lg dark:prose-invert max-w-none">
              <h3 className="mt-6 text-2xl md:text-3xl font-extrabold">About the video</h3>
              <p className="italic">{data.description}</p>
            </article>
          )}

          {/* Related videos */}
          {relatedVideos.length > 0 && (
            <HorizontalSlider title="You May Also Like">
              {relatedVideos.map((vid) => (
                <SliderCard
                  key={vid._id}
                  id={vid._id}
                  title={vid.title}
                  artist={vid.artist}
                  cover={vid.coverUrl}
                  downloads={vid.downloadCount}
                  publishedAt={vid.createdAt}
                  genre={vid.genre}
                  views={vid.viewCount}
                  href={`/videos/${vid._id}`}
                />
              ))}
            </HorizontalSlider>
          )}

          {/* Comments */}
          <Comments model="Video" id={data._id} initialComments={data.latestComments} user={user} />
        </section>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4">
          <div className="sticky top-20 space-y-6">
            <SharePanel title={data.title} artist={data.artist} shareCount={shareCount} onShare={() => handleInteraction("share")} />

            <ChartStatsCard
              data={{
                trendingPosition: data.trendingPosition,
                chartPosition: data.chartPosition,
                plays: data.viewCount,
                likes: likeCount,
                shares: shareCount,
                downloads: downloadCount,
              }}
            />
          </div>
        </aside>
      </div>

      {/* Modals */}
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} shareUrl={pageUrl} title={data.title} />
      <DownloadModal data={data} open={downloadOpen} onClose={() => setDownloadOpen(false)} fileUrl={data.fileUrl} onConfirmDownload={() => handleInteraction("download")} />
    </main>
  );
}
