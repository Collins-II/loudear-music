"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image, { ImageLoaderProps } from "next/image";
import {
  Heart,
  Share2,
  DownloadCloud,
  Flame,
  Play,
} from "lucide-react";
import { getSocket } from "@/lib/socketClient";
import { SongSerialized } from "@/actions/getSongById";
import CustomPlayer from "@/components/music/CustomPlayer";
import { Badge } from "@/components/ui/badge";
import ShareModal from "@/components/modals/ShareModal";
import DownloadModal from "@/components/modals/DownloadModal";
import { formatDate, timeAgo } from "@/lib/utils";
import { BiSolidTimer } from "react-icons/bi";
import HorizontalSlider from "@/components/sliders/HorizontalSlider";
import { SliderCard } from "@/components/sliders/SliderCard";
import Comments from "@/components/comments/Comments";
import { motion } from "framer-motion";

interface ClientPageProps {
  data: SongSerialized;
  relatedSongs: SongSerialized[];
}

export default function ClientPage({ data, relatedSongs }: ClientPageProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const userId = session?.user?.id;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(data.likeCount ?? 0);
  const [shareCount, setShareCount] = useState<number>(data.shareCount ?? 0);
  const [downloadCount, setDownloadCount] = useState<number>(
    data.downloadCount ?? 0
  );
  const [imgError, setImgError] = useState(false);
  const isTrending = true;
  const chartRank = 12;
  const [shareOpen, setShareOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  // Socket interactions
  useEffect(() => {
    if (!data._id) return;
    const socket = getSocket();
    socket.emit("join", data._id);

    socket.on("interaction:update", (payload: any) => {
      if (payload.id !== data._id) return;
      setLikeCount(payload.counts.likes);
      setShareCount(payload.counts.shares);
      setDownloadCount(payload.counts.downloads);
      setLiked(payload.userLiked);
    });

    return () => {
      socket.off("interaction:update");
    };
  }, [data._id]);

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

  const handleInteraction = async (type: "like" | "share" | "download") => {
    if (!userId) return alert("Please sign in to interact.");
    try {
      await fetch(`/api/interactions/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data._id, model: "Song", userId }),
      });
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  return (
    <main className="bg-white dark:bg-black text-gray-900 dark:text-gray-100 py-16 px-4 md:px-10">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">
        {/* LEFT: Main Song Details */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 space-y-10"
        >
          {/* Cover + Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="relative w-full md:w-72 h-72 overflow-hidden border-b-[6px] border-black dark:border-white bg-gray-100 rounded-none">
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
              />
              {isTrending && (
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-semibold shadow-md">
                  <Flame size={14} /> Trending
                </div>
              )}
              {chartRank && chartRank <= 100 && (
                <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/80 text-white text-xs font-bold shadow-md">
                  #{chartRank}
                </div>
              )}
              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleInteraction("like")}
                  className="p-3 bg-white text-black rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <Play size={22} />
                </motion.button>
              </div>
            </div>

            {/* Song Details */}
            <div className="flex-1 space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight">
                {data.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                by <span className="font-semibold">{data.artist}</span>
              </p>

              {/* Genre + Date */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-full px-3 py-1 bg-black text-white dark:bg-white dark:text-black font-semibold uppercase">
                  {data.genre || "Single"}
                </Badge>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <BiSolidTimer className="w-4 h-4" />
                  {timeAgo(data.createdAt)}
                </span>
              </div>

              {/* Interactions */}
              <div className="flex items-center gap-6 mt-4 text-sm text-gray-700 dark:text-gray-300">
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
                  onClick={() => setShareOpen(true)}
                >
                  <Share2 className="w-5 h-5" /> {shareCount}
                </button>

                <button
                  className="flex items-center gap-2 hover:text-green-600 transition"
                  onClick={() => setDownloadOpen(true)}
                >
                  <DownloadCloud className="w-5 h-5" /> {downloadCount}
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 dark:bg-neutral-900 border-b-[4px] border-black dark:border-white p-6">
            <h2 className="text-2xl font-extrabold mb-3">
              {formatDate(data.releaseDate as string)} — {data.title}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
              The band’s fans gleefully push to the front of their gigs in order
              to get blasted with any manner of fake bodily fluids that erupt
              from the towering, cartoonish dummies. But over the weekend,
              some folks allegedly got into a tizzy over one aspect of GWAR’s
              current show — a mock beheading of Tesla CEO Elon Musk...
            </p>
          </div>

          {/* Player */}
          <CustomPlayer
            src={data.fileUrl}
            title={data.title}
            artist={data.artist}
            coverUrl={data.coverUrl}
            onDownload={() => setDownloadOpen(true)}
          />

          {/* Related Songs */}
          {relatedSongs.length > 0 && (
            <HorizontalSlider title="May Also Like" className="mt-12">
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
                />
              ))}
            </HorizontalSlider>
          )}

          {/* Comments */}
          <Comments
            model="Song"
            id={data._id}
            initialComments={data.latestComments}
            user={user}
          />
        </motion.section>

        {/* RIGHT: Ads / Sidebar */}
        <aside className="w-full lg:w-[300px] flex flex-col gap-8">
          <div className="h-32 bg-gradient-to-r from-pink-600 to-red-500 flex items-center justify-center text-white font-bold text-lg rounded-none border-b-[4px] border-black">
            Ad Space
          </div>
          <div className="h-64 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg rounded-none border-b-[4px] border-black">
            Ad Space
          </div>
        </aside>
      </div>

      {/* Modals */}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shareUrl={`${process.env.NEXT_PUBLIC_APP_URL}/music/song/${data._id}`}
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
