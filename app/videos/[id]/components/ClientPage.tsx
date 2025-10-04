"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image, { ImageLoaderProps } from "next/image";
import { useSession } from "next-auth/react";
import io from "socket.io-client";

import {
  Heart,
  Share2,
  DownloadCloud,
  Clock,
  Flame,
} from "lucide-react";

import { incrementInteraction, VideoSerialized } from "@/actions/getSongById";
import { timeAgo, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Comments from "@/components/comments/Comments";
import HorizontalSlider from "@/components/sliders/HorizontalSlider";
import { SliderCard } from "@/components/sliders/SliderCard";

interface VideoPageProps {
  data: VideoSerialized;
  relatedVideos: VideoSerialized[];
}

const socket = io(); // ✅ initialize socket client

export default function VideoPage({ data, relatedVideos }: VideoPageProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const userId = session?.user?.id;

  const [liked, setLiked] = useState(
    false
  );
  const [likeCount, setLikeCount] = useState(data.likeCount);
  const [shareCount, setShareCount] = useState(data.shareCount);
  const [downloadCount, setDownloadCount] = useState(data.downloadCount);
  const [related] = useState<VideoSerialized[]>(relatedVideos);
  const [downloading, setDownloading] = useState(false);

  const chartRank = 12;
  const isTrending = true;

  // 🔹 Join video room and listen for updates
  useEffect(() => {
    const room = `Video:${data._id}`;
    socket.emit("join", room);

    socket.on("interaction:update", (payload) => {
      if (payload.itemId === data._id && payload.model === "Video") {
        setLikeCount(payload.counts.likes);
        setShareCount(payload.counts.shares);
        setDownloadCount(payload.counts.downloads);
      }
    });

    return () => {
      socket.emit("leave", room);
      socket.off("interaction:update");
    };
  }, [data._id]);

const handleInteraction = async (type: "like" | "share" | "download" | "unlike") => {
  if (!userId) return alert("Please sign in to interact.");

  try {
    let action: "like" | "unlike" | "share" | "download" = type;

    if (type === "like") {
      if (liked) {
        // user already liked → unlike
        setLiked(false);
        setLikeCount((prev) => prev - 1);
        action = "unlike";
      } else {
        // user not yet liked → like
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    }

    if (type === "share") {
      setShareCount((prev) => prev + 1);
    }

    if (type === "download") {
      setDownloadCount((prev) => prev + 1);
    }

    // ✅ Call backend with correct action
    await incrementInteraction(data._id, "Video", action, userId);
  } catch (err) {
    console.error(err);
  }
};



  const handleDownload = async () => {
    if (!data.fileUrl) return;
    setDownloading(true);

    try {
      // Trigger download
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

      // Count download
      await handleInteraction("download");
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
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
    <main className="bg-white text-gray-900 py-16 px-4 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
        {/* LEFT COLUMN: Ads */}
        <div className="space-y-8">
          <Card className="h-24 bg-red-500 flex items-center justify-center border-dashed">
            <p className="text-white">Ad Space</p>
          </Card>
          <Card className="hidden h-80 bg-blue-400 md:flex items-center justify-center border-dashed">
            <p className="text-white">Ad Space</p>
          </Card>
        </div>

        {/* RIGHT COLUMN: Main Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Video Cover */}
            <div className="w-full md:w-72 h-72 relative rounded-2xl overflow-hidden shadow-lg border">
              <Image
                src={data.coverUrl || "/assets/images/placeholder_cover.jpg"}
                alt={data.title}
                fill
                className="object-cover"
                loader={customImageLoader}
              />
            </div>

            {/* Details */}
            <div className="flex-1 space-y-3">
              <h1 className="text-slate-900 text-3xl md:text-4xl font-extrabold tracking-tight">
                {data.title}
              </h1>
              <p className="text-gray-600 text-sm">
                by <span className="font-semibold">{data.artist}</span>
              </p>

              {/* Genre & Uploaded Time */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-full px-3 py-1 text-sm text-white bg-pink-600">
                  {data.genre || "Album"}
                </Badge>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {timeAgo(data.createdAt)}
                </span>
              </div>

              {/* Trending / Rank Badges */}
              <div className="flex items-center gap-2">
                {isTrending && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-semibold shadow-md">
                    <Flame size={14} className="animate-bounce" /> Trending
                  </div>
                )}
                {chartRank && chartRank <= 100 && (
                  <div className="px-2 py-1 rounded-full bg-black/80 text-white text-xs font-bold shadow-md">
                    #{chartRank}
                  </div>
                )}
              </div>

              {/* Interactions */}
              <div className="flex items-center gap-6 mt-4 text-sm text-gray-700">
                <button
                  className="flex items-center gap-2 hover:text-red-600 transition"
                  onClick={() => handleInteraction("like")}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      liked ? "text-red-600 fill-red-600" : ""
                    }`}
                  />
                  {likeCount}
                </button>
                <button
                  className="flex items-center gap-2 hover:text-blue-600 transition"
                  onClick={() => handleInteraction("share")}
                >
                  <Share2 className="w-5 h-5" /> {shareCount}
                </button>
                <button
                  className="flex items-center gap-2 hover:text-green-600 transition"
                  onClick={handleDownload}
                  disabled={downloading}
                >
                  <DownloadCloud className="w-5 h-5" /> {downloadCount}
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {["Power", "Enjoyment", "Grace"]?.map((tag, i) => (
              <Badge
                key={i}
                className="rounded-full px-3 py-1 cursor-pointer bg-blue-500 hover:bg-black hover:text-white transition"
                onClick={() => (window.location.href = `/search?q=${tag}`)}
              >
                #{tag}
              </Badge>
            ))}
          </div>
          <div className="w-full h-[4px] bg-black -z-0" />

          {/* Description */}
          <div className="rounded-2xl">
            <p className="text-black font-extrabold text-xl pb-4">
              {`${formatDate(data.createdAt)} - ${data.title}`}
            </p>
            <p className="text-gray-700 text-md leading-relaxed prose">
              {data.description || "No description available for this video."}
            </p>
          </div>

          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg"
          >
            <iframe
              src={data.fileUrl}
              title={data.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </motion.div>

          {/* Download Button */}
          <div>
            <Button
              className={`flex items-center gap-2 hover:text-green-600 transition ${
                downloading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleDownload}
              disabled={downloading}
            >
              Download <DownloadCloud className="w-5 h-5" />
              {downloading ? "Downloading..." : ""}
            </Button>
          </div>

          <div className="w-full h-[4px] bg-black -z-0" />

          {/* Related Videos */}
          {related.length > 0 && (
            <HorizontalSlider title="You May Also Like" >
              {related.map((vid) => (
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
                />
              ))}
            </HorizontalSlider>
          )}

          {/* Comments */}
          <Comments
            model="Video"
            id={data._id}
            initialComments={data.latestComments}
            user={user}
          />
        </div>
      </div>
    </main>
  );
}
