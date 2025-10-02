"use client";

import { motion } from "framer-motion";
import Image, { ImageLoaderProps } from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Play, Flame, Crown } from "lucide-react";

interface ChartCardProps {
  id: string;
  title: string;
  artist: string;
  cover: string;
  href: string;
  rank: number; // current chart position
  peak: number; // peak position
  weeksOn: number; // weeks on chart
  isTrending?: boolean;
}

const customImageLoader = ({ src, width, quality }: ImageLoaderProps) => {
  try {
    const url = new URL(src);
    if (url.hostname.includes("res.cloudinary.com")) {
      return `${src}?w=${width}&q=${quality || 80}&f=auto`;
    }
    return src;
  } catch {
    return src; // fallback
  }
};

const Shimmer = () => (
  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-lg" />
);

export function ChartCard({
  title,
  artist,
  cover,
  href,
  rank,
  peak,
  weeksOn,
  isTrending,
}: ChartCardProps) {
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className="group relative w-full max-w-md cursor-pointer"
    >
      <Link href={href}>
        <div className="flex flex-col sm:flex-row overflow-hidden bg-white dark:bg-black/90 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
          {/* Rank Badge */}
          <div className="flex items-center justify-center h-12 sm:h-auto sm:w-14 bg-gradient-to-b from-indigo-600 to-purple-600 text-white text-lg sm:text-2xl font-extrabold shrink-0">
            #{rank}
          </div>

          {/* Cover */}
          <div className="relative h-40 w-full sm:h-32 sm:w-32 shrink-0">
            {loading && <Shimmer />}
            <Image
              src={!imgError && cover ? cover : "/assets/images/placeholder_cover.jpg"}
              alt={title}
              loader={customImageLoader}
              fill
              className={`object-cover transition-opacity duration-500 ${
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

            {/* Hover Play */}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg"
              >
                <Play className="w-6 h-6 text-black" />
              </motion.button>
            </div>

            {/* Trending */}
            {isTrending && (
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-semibold shadow-md">
                <Flame size={14} /> Hot
              </div>
            )}

            {/* Peak Badge */}
            {rank === 1 && (
              <div className="absolute top-2 right-2 p-1 rounded-full bg-yellow-400 text-black shadow-md">
                <Crown size={16} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col justify-between flex-1 p-3 sm:p-4">
            <div>
              <h4 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white leading-snug line-clamp-1">
                {title}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {artist}
              </p>
            </div>

            {/* Chart Stats */}
            <div className="flex flex-wrap justify-between mt-3 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
              <span>Peak: #{peak}</span>
              <span>{weeksOn} Weeks</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
