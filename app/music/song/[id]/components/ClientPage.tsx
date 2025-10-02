"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image, { ImageLoaderProps } from "next/image";
import { Heart, Share2, DownloadCloud, Flame } from "lucide-react";

import { getSocket } from "@/lib/socketClient";
import { SongSerialized } from "@/actions/getSongById";
import CustomPlayer from "@/components/music/CustomPlayer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ShareModal from "@/components/modals/ShareModal";
import DownloadModal from "@/components/modals/DownloadModal";
import { formatDate, timeAgo } from "@/lib/utils";
import { BiSolidTimer } from "react-icons/bi";
import HorizontalSlider from "@/components/sliders/HorizontalSlider";
import { SliderCard } from "@/components/sliders/SliderCard";
import Comments from "@/components/comments/Comments";

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
  const [downloadCount, setDownloadCount] = useState<number>(data.downloadCount ?? 0);
  const [imgError, setImgError] = useState(false);
  const [isTrending, setSetIsTrending] = useState(true);

  const chartRank = 12;

  const [shareOpen, setShareOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  // --- Socket interactions ---
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
    <main className="bg-white text-gray-900 py-16 px-4 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          {/* Ad Block */}
          <Card className="h-24 bg-red-500 flex items-center justify-center border-dashed">
            <p className="text-white">Ad Space</p>
          </Card>


          {/* Ad Block */}
          <Card className="h-80 bg-blue-400 flex items-center justify-center border-dashed">
            <p className="text-white">Ad Space</p>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-10">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Cover */}
            <div className="w-full md:w-72 h-72 relative rounded-2xl overflow-hidden shadow-lg border">
              <Image
                src={data.coverUrl || "/assets/images/placeholder_cover.jpg"}
                alt={data.title}
                fill
                className="object-cover"
                loader={customImageLoader}
                onError={() => setImgError(true)}
              />
              {imgError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
                  No Image
                </div>
              )}
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
                  <BiSolidTimer className="w-4 h-4" />
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
                    className={`w-5 h-5 ${liked ? "text-red-600 fill-red-600" : ""}`}
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
          
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {["Power", "Enjoyment" ,"Grace"]?.map((tag, i) => (
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
          {/* Description Section */}
          <div className="bg-white rounded-2xl">
            <p className="text-black font-extrabold text-xl pb-4">{`${formatDate(data.releaseDate as string)} - ${data.title} `}</p>
            <p className="text-gray-700 text-md leading-relaxed prose" >The band’s fans gleefully push to the front of their gigs in order to get blasted with any manner of fake bodily fluids that erupt from the towering, cartoonish dummies. But over the weekend, some folks who apparently just discovered the band, allegedly got into a tizzy over one aspect of GWAR’s current show — a mock beheading of Tesla CEO and former DOGE boss Elon Musk. The tweets appeared to be an attempt to gin up outrage over the formerly uncontroversial bit, at a time when Donald Trump and the chairman of the FCC have been sending ominous messages about their view of the limits on the First Amendment’s right to free speech.</p>
          </div>


          {/* Player */}
          <CustomPlayer
            src={data.fileUrl}
            title={data.title}
            artist={data.artist}
            coverUrl={data.coverUrl}
            onDownload={() => setDownloadOpen(true)}
          />
          {relatedSongs.length > 0 && (
            <HorizontalSlider title="May Also Like" className="slider-may-like" gap={6}>
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
        </div>
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
