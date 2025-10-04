"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image, { ImageLoaderProps } from "next/image";
import {
  Heart,
  Share2,
  DownloadCloud,
  Clock,
  Flame,
} from "lucide-react";

import { getSocket } from "@/lib/socketClient";
import { AlbumSerialized, SongSerialized } from "@/actions/getSongById";
import AlbumPlayer from "@/components/music/AlbumPlayer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ShareModal from "@/components/modals/ShareModal";
import Comments from "@/components/comments/Comments";
import { timeAgo, formatDate } from "@/lib/utils";
import HorizontalSlider from "@/components/sliders/HorizontalSlider";
import { SliderCard } from "@/components/sliders/SliderCard";
import { Separator } from "@/components/ui/separator";

interface AlbumPageProps {
  data: AlbumSerialized;
  relatedSongs: SongSerialized[];
}

export default function AlbumPage({ data, relatedSongs }: AlbumPageProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const userId = session?.user?.id;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(data.likeCount ?? 0);
  const [shareCount, setShareCount] = useState<number>(data.shareCount ?? 0);
  const [downloadCount, setDownloadCount] = useState<number>(data.downloadCount ?? 0);

  const [shareOpen, setShareOpen] = useState(false);
  //const [downloadOpen, setDownloadOpen] = useState(false);

  const [isTrending] = useState(true);
  const chartRank = 12;

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

  const handleInteraction = async (type: "like" | "share" | "download") => {
    if (!userId) return alert("Please sign in to interact.");
    try {
      await fetch(`/api/interactions/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data._id, model: "Album", userId }),
      });
    } catch (err) {
      console.error("Fetch error:", err);
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
        {/* LEFT COLUMN (Ads) */}
        <div className="space-y-8 order-2 lg:order-1">
          <Card className="h-24 flex items-center justify-center border-dashed bg-gray-100">
            <p className="text-gray-500">Ad Space</p>
          </Card>
          <Card className="h-80 flex items-center justify-center border-dashed bg-gray-100">
            <p className="text-gray-500">Ad Space</p>
          </Card>
        </div>

        {/* RIGHT COLUMN (Main Content) */}
        <div className="lg:col-span-2 space-y-12 order-1 lg:order-2">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Cover */}
            <div className="w-full md:w-72 h-72 relative rounded-2xl overflow-hidden shadow-lg border">
              <Image
                src={data.coverUrl || data.songs?.[0]?.coverUrl || "/assets/images/placeholder_cover.jpg"}
                alt={data.title}
                fill
                className="object-cover"
                loader={customImageLoader}
              />
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
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
                 // onClick={() => setDownloadOpen(true)}
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
          <Separator />
          {/* Description */}
          <div className="rounded-2xl ">
            <p className="text-black font-extrabold text-xl pb-4">
              {`${formatDate(data.createdAt as string)} - ${data.title}`}
            </p>
            <p className="text-gray-700 text-md leading-relaxed prose">
              {data.description ||
                "No description available for this album. Stay tuned for updates."}
            </p>
          </div>

          {/* Player */}
          <AlbumPlayer
            userId={userId}
            tracks={data.songs as SongSerialized[]}
            albumTitle={data.title}
            albumArtist={data.artist}
            coverUrl={data.coverUrl}
          />

          {/* Related Songs */}
          {relatedSongs?.length > 0 && (
            <HorizontalSlider title="You May Also Like" >
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
            model="Album"
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
        shareUrl={`${process.env.NEXT_PUBLIC_APP_URL}/music/album/${data._id}`}
        title={data.title}
      />
    </main>
  );
}
