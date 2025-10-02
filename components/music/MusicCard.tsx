"use client";

import { motion } from "framer-motion";
import Image, { ImageLoaderProps } from "next/image";
import { DownloadCloud, Play, Flame, Eye } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

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
  chartRank?: number; // e.g., 1 for #1, 25 for #25 in Top 100
}

// Safe custom loader for Cloudinary and relative paths
const customImageLoader = ({ src, width, quality }: ImageLoaderProps) => {
  try {
    const url = new URL(src);
    if (url.hostname.includes("res.cloudinary.com")) {
      return `${src}?w=${width}&q=${quality || 80}&f=auto`;
    }
    return src;
  } catch {
    return src; // relative path fallback
  }
};

// Shimmer skeleton component
const Shimmer = () => (
  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-l-2xl" />
);

export function MusicCard({
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.04, rotate: 0.5 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className="group relative w-full min-w-[260px] max-w-sm cursor-pointer"
    >
      <Link href={href}>
        <div className="flex flex-col sm:flex-row overflow-hidden bg-white dark:bg-black/90 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
          {/* Cover */}
          <div className="relative h-44 sm:h-32 sm:w-32 shrink-0">
            {loading && <Shimmer />}
            <Image
              src={!imgError && cover ? cover : "/assets/images/placeholder_cover.jpg"}
              alt={title}
              loader={customImageLoader}
              fill
              className={`object-cover rounded-t-2xl sm:rounded-l-2xl sm:rounded-t-none transition-opacity duration-500 ${
                loading ? "opacity-0" : "opacity-100"
              }`}
              placeholder="blur"
              blurDataURL="/images/placeholder-blur.png"
              onError={() => {
                setImgError(true);
                setLoading(false);
              }}
              onLoad={() => setLoading(false)}
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg"
              >
                <Play className="w-6 h-6 text-black" />
              </motion.button>
            </div>

            {/* Trending / Rank Badge */}
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
          <div className="flex flex-col justify-between w-full p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 truncate mb-1">
                {artist} • <span className="font-extrabold text-blue-500">{genre}</span>
              </p>
              <h4 className="text-base md:text-lg font-extrabold text-gray-900 dark:text-white leading-snug line-clamp-1">
                {title}
              </h4>
            </div>

            <div className="flex justify-between items-center mt-3 text-sm">
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                {downloads} <DownloadCloud size={14} />
              </span>
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                {views} <Eye size={14} />
              </span>
              <span className="italic text-gray-400 text-xs">
                {timeAgo(publishedAt)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
