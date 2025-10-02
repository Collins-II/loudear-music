"use client";

import { motion } from "framer-motion";
import Image, { ImageLoaderProps } from "next/image";
import { DownloadCloud, Eye, Play } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface VideoCardProps {
  id: string;
  title: string;
  artist: string;
  cover: string;
  downloads: number;
  publishedAt?: string;
  category?: string;
  views?: number;
  videoUrl: string;
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

const Shimmer = () => (
  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-2xl" />
);

export function VideoCard({
  id,
  title,
  artist,
  cover,
  downloads,
  category,
  views = 0,
  videoUrl,
}: VideoCardProps) {
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const preloadRef = useRef<HTMLVideoElement | null>(null);
  const [snippetStart, setSnippetStart] = useState(0);
  const snippetLength = 5;

  // Preload video (hidden)
  useEffect(() => {
    if (preloadRef.current) {
      preloadRef.current.src = videoUrl;
      preloadRef.current.preload = "auto";
      preloadRef.current.muted = true;
      preloadRef.current.playsInline = true;
      preloadRef.current.load();
    }
  }, [videoUrl]);

  const handleMouseEnter = () => {
    if (videoRef.current && preloadRef.current) {
      const duration = preloadRef.current.duration || 30;
      const maxStart = Math.max(0, duration - snippetLength);
      const start = Math.random() * maxStart;
      setSnippetStart(start);

      // jump to the preloaded start position
      preloadRef.current.currentTime = start;

      // once preload is seeked, sync with visible player
      const syncAndPlay = () => {
        if (videoRef.current && preloadRef.current) {
          videoRef.current.currentTime = preloadRef.current.currentTime;
          videoRef.current.play().catch(() => {});
        }
        preloadRef.current?.removeEventListener("seeked", syncAndPlay);
      };

      preloadRef.current.addEventListener("seeked", syncAndPlay);
    }
    setHovered(true);
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setHovered(false);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= snippetStart + snippetLength) {
      videoRef.current.currentTime = snippetStart;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="w-full border-b-[2px] border-gray-200"
    >
      <Link href={`/videos/${id}`} className="w-full block">
        <div
          className="w-full group overflow-hidden transition-all bg-white rounded-2xl"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative h-52 w-full">
            {!hovered ? (
              <>
                {loading && <Shimmer />}
                <Image
                  src={!imgError && cover ? cover : "/assets/images/placeholder_cover.jpg"}
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
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Play className="w-10 h-10 text-white drop-shadow-lg" />
                </div>
              </>
            ) : (
              <video
                ref={videoRef}
                src={videoUrl}
                muted
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                onTimeUpdate={handleTimeUpdate}
              />
            )}

            {/* preload hidden video (buffered for instant playback) */}
            <video ref={preloadRef} className="hidden" />

            {category && (
              <div className="absolute -bottom-1 left-0 bg-black/80 text-white text-[10px] md:text-xs px-2 py-0.5 md:py-1 shadow-lg rounded-tr-lg">
                <h3 className="text-white font-semibold tracking-tight">{category}</h3>
              </div>
            )}
          </div>

          <div className="w-full px-3 pb-4 pt-6 space-y-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 leading-tight line-clamp-1">
                {title}
              </h3>
              <p className="text-md text-gray-600 truncate">{artist}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <DownloadCloud className="w-3 h-3" />
                {downloads}
              </span>

              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {views}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
