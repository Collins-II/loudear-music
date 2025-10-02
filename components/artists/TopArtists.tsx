"use client";

import { motion } from "framer-motion";
import Image, { ImageLoaderProps } from "next/image";
import { CardContent } from "@/components/ui/card";
import { DownloadCloud } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface TopSongCardProps {
  position: number;       // Top position (1, 2, 3…)
  id: string;             // Song id
  title: string;
  artist: string;
  href: string;
  cover: string;
  genre: string;
  downloads: number;
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
  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-2xl" />
);

export function TopSongCard({ position, id, title, artist, href, cover, downloads, genre }: TopSongCardProps) {
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="w-full cursor-pointer"
    >
      <Link href={href}>
        <div className="flex flex-col sm:flex-row overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-lg transition relative">
          {/* Cover */}
          <div className="relative w-full sm:w-24 h-48 sm:h-24 flex-shrink-0">
            {loading && <Shimmer />}
            <Image
              src={!imgError && cover ? cover : "/assets/images/placeholder_cover.jpg"}
              alt={title}
              loader={customImageLoader}
              fill
              className={`object-cover rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none transition-opacity duration-500 ${loading ? "opacity-0" : "opacity-100"}`}
              placeholder="blur"
              blurDataURL="/images/placeholder-blur.png"
              onError={() => {
                setImgError(true);
                setLoading(false);
              }}
              onLoad={() => setLoading(false)}
            />
            {/* Position badge */}
            <div className="absolute top-2 left-2 bg-black/70 text-white text-sm md:text-base font-bold px-2 py-0.5 rounded-md shadow-lg">
              #{position}
            </div>
            {/* Genre badge */}
            <div className="absolute bottom-0 left-0 bg-green-600 text-white text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 shadow-lg whitespace-nowrap rounded-tr-md sm:rounded-tr-none sm:rounded-tl-none sm:rounded-bl-none">
              <h3 className="font-extrabold tracking-tight truncate">{genre}</h3>
            </div>
          </div>

          {/* Content */}
          <CardContent className="flex flex-col justify-between p-3">
            <div className="overflow-hidden pr-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-600 font-medium truncate mb-1">
                {artist}
              </p>
              <p className="text-sm font-bold text-gray-900 truncate">
                {title}
              </p>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="flex items-center gap-1 text-[10px] md:text-xs text-gray-500 tracking-tight">
                {downloads.toLocaleString()} <DownloadCloud size={12} />
              </p>
            </div>
          </CardContent>
        </div>
      </Link>
    </motion.div>
  );
}
