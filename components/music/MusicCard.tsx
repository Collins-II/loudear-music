"use client";

import { motion } from "framer-motion";
import Image, { ImageLoaderProps } from "next/image";
import Link from "next/link";
import { Play, Flame, DownloadCloud, Eye } from "lucide-react";
import { useState } from "react";
import { timeAgo } from "@/lib/utils";

interface MusicCardProps {
  id: string;
  title: string;
  artist: string;
  href: string;
  cover: string;
  downloads: number;
  views: number;
  genre: string;
  publishedAt: string;
  isTrending?: boolean;
  chartRank?: number;
}

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

export function MusicCard({
  id,
  title,
  artist,
  href,
  cover,
  downloads,
  views,
  genre,
  publishedAt,
  isTrending,
  chartRank,
}: MusicCardProps) {
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      key={id}
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Link href={href}>
        <div className="overflow-hidden border-b-[4px] border-black bg-white transition relative group rounded-none sm:rounded-none hover:shadow-2xl duration-300">
          {/* Cover Image */}
          <div className="relative h-56 w-full sm:h-60">
            {loading && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300" />
            )}
            <Image
              src={!imgError && cover ? cover : "/assets/images/placeholder_cover.jpg"}
              alt={title}
              loader={customImageLoader}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => {
                setImgError(true);
                setLoading(false);
              }}
              onLoad={() => setLoading(false)}
            />

            {/* Hover Play Button */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-white text-black rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Play size={20} />
              </motion.button>
            </div>

            {/* Genre Tag */}
            <div className="absolute -bottom-3 left-0 md:-bottom-4 md:right-0 bg-black text-white text-1xl px-2 md:px-4 py-0.5 md:py-1 shadow-lg whitespace-nowrap uppercase font-bold">
              {genre}
            </div>

            {/* Trending / Chart Badge */}
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
          </div>

          {/* Content */}
          <div className="py-4 space-y-1 pl-2 pr-4">
            <p className="flex justify-start text-[11px] uppercase font-bold text-slate-500 tracking-wide mt-2">
              {artist} · {timeAgo(publishedAt)}
            </p>

            <h3 className="text-black text-2xl md:text-3xl font-extrabold line-clamp-2">
              {title}
            </h3>

            <div className="flex justify-between items-center mt-3 text-xs md:text-sm text-gray-600 font-medium">
              <span className="flex items-center gap-1">
                <DownloadCloud size={14} /> {downloads.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={14} /> {views.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
