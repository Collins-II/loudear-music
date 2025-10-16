"use client";

import { motion } from "framer-motion";
import Image, { ImageLoaderProps } from "next/image";
import { CardContent } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface TopSongCardProps {
  position: number;
  id: string;
  title: string;
  curator: string;
  href: string;
  thumbnail: string;
  videoUrl: string;
  genre: string;
  views: number;
}

// Safe custom loader
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

const Shimmer = () => (
  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-2xl" />
);

export function TopSongCard({
  position,
  title,
  curator,
  href,
  thumbnail,
  genre,
  views,
}: TopSongCardProps) {
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="w-full cursor-pointer"
    >
      <Link href={href}>
        <div
          className="flex flex-col overflow-hidden bg-white rounded-tl-2xl hover:shadow-lg transition relative"
        >
          {/* Thumbnail or snippet */}
          <div className="relative w-full h-48 sm:h-28 flex-shrink-0">
    
                {loading && <Shimmer />}
                <Image
                  src={!imgError && thumbnail ? thumbnail : "/assets/images/placeholder_cover.jpg"}
                  alt={title}
                  loader={customImageLoader}
                  fill
                  className={`object-cover rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none transition-opacity duration-500 ${
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
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/40 backdrop-blur-sm p-3 rounded-full hover:bg-black/60 transition">
                    <PlayCircle size={32} className="text-white" />
                  </div>
                </div>



            {/* Position badge */}
            <div className="absolute top-2 left-2 bg-black/70 text-white text-sm md:text-base font-bold px-2 py-0.5 rounded-md shadow-lg">
              #{position}
            </div>
            {/* Genre badge */}
            <div className="absolute bottom-0 left-0 bg-black text-white text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 shadow-lg whitespace-nowrap rounded-tr-md sm:rounded-tr-none sm:rounded-tl-none sm:rounded-bl-none">
              <h3 className="font-extrabold tracking-tight truncate">{genre}</h3>
            </div>
          </div>

          {/* Content */}
          <CardContent className="flex flex-col justify-between px-1 py-3 w-full">
            <div className="overflow-hidden pr-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-600 font-medium truncate">
                {curator}
              </p>
              <p className="text-sm md:text-base font-bold text-gray-900 truncate capitalize">{title}</p>
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="flex items-center gap-1 text-[10px] md:text-xs text-gray-500 tracking-tight">
                {views} views
              </p>
            </div>
          </CardContent>
        </div>
      </Link>
    </motion.div>
  );
}
