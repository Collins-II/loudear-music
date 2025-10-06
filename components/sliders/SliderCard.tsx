"use client";

import { motion } from "framer-motion";
import Image, { ImageLoaderProps } from "next/image";
import { DownloadCloud, Eye, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface SliderCardProps {
  id: string;
  title: string;
  artist: string;
  cover: string;
  downloads: number;
  publishedAt: string;
  genre?: string;
  views?: number;
  href: string;
}

// Safe Cloudinary / relative loader
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

// Shimmer skeleton
const Shimmer = () => (
  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-2xl" />
);

export function SliderCard({
  title,
  artist,
  cover,
  downloads,
  genre,
  views = 0,
  href,
}: SliderCardProps) {
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="w-54 border-b-[2px] border-gray-200"
    >
      <Link href={href} className="w-full cursor-pointer block">
        <div className="w-full group overflow-hidden transition-all bg-white rounded-2xl">
          {/* Cover */}
          <div className="relative h-52 w-full">
            {loading && <Shimmer />}
            <Image
              src={
                !imgError && cover
                  ? cover
                  : "/assets/images/placeholder_cover.jpg"
              }
              alt={title}
              loader={customImageLoader}
              fill
              className={`object-cover rounded-2xl transition-opacity duration-500 ${
                loading ? "opacity-0" : "opacity-100"
              }`}
              priority
              placeholder="blur"
              blurDataURL="/assets/images/placeholder_cover.jpg"
              onLoad={() => setLoading(false)}
              onError={() => {
                setImgError(true);
                setLoading(false);
              }}
            />

            {/* genre Ribbon */}
            <div className="absolute -bottom-1 left-0 bg-black/80 text-white text-[10px] md:text-xs px-2 py-0.5 md:py-1 shadow-lg rounded-tr-lg">
              <h3 className="text-white font-semibold tracking-tight">
                {genre}
              </h3>
            </div>

            {/* Play Overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <Play className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
          </div>

          {/* Content */}
          <div className="w-full px-2 pb-4 pt-6 space-y-2">
            {/* Title + Artist */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 leading-tight line-clamp-1">
                {title}
              </h3>
              <p className="text-md text-gray-600 truncate">{artist}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <DownloadCloud className="w-3 h-3" />
                {downloads}
              </span>

              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {views}
              </span>

              {/*<span className="text-xs text-gray-500">
                {timeAgo(publishedAt)}
              </span>*/}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
