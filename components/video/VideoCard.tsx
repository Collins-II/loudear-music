"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { DownloadCloud, Eye } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface VideoCardProps {
  id: string;
  title: string;
  artist: string;
  cover: string;
  downloads: number;
  category?: string;
  views?: number;
  videoUrl: string;
  snippetLength?: number; // optional (default 5s)
}

const shimmer = (
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
  snippetLength = 5,
}: VideoCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Detect touch devices
  useEffect(() => {
    setIsTouchDevice(window.matchMedia("(hover: none)").matches);
  }, []);

  // Random snippet start (within 0–10 seconds)
  const [snippetStart] = useState(() => Math.random() * 10);

  // Preload video and prepare it
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata"; // lighter preload by default

    const handleCanPlay = () => setVideoReady(true);
    video.addEventListener("canplaythrough", handleCanPlay);

    return () => video.removeEventListener("canplaythrough", handleCanPlay);
  }, [videoUrl]);

  // Handle playback control
  const playSnippet = () => {
    const video = videoRef.current;
    if (!video || !videoReady) return;
    video.currentTime = snippetStart;
    video.play().catch(() => {});
    const handleTimeUpdate = () => {
      if (video.currentTime >= snippetStart + snippetLength) {
        video.currentTime = snippetStart;
      }
    };
    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  };

  const stopSnippet = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = snippetStart;
    }
  };

  // Hover / Tap logic
  const handleHoverStart = () => {
    if (!isTouchDevice) {
      setIsPlaying(true);
      playSnippet();
    }
  };

  const handleHoverEnd = () => {
    if (!isTouchDevice) {
      setIsPlaying(false);
      stopSnippet();
    }
  };

  const handleTap = (e: React.MouseEvent) => {
    if (!isTouchDevice) return;
    e.preventDefault(); // prevent navigating immediately

    setIsPlaying((prev) => {
      const next = !prev;
      if (next) playSnippet();
      else stopSnippet();
      return next;
    });
  };

  return (
    <motion.div
      whileHover={!isTouchDevice ? { scale: 1.02 } : undefined}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="w-full border-b-[4px] border-black  overflow-hidden bg-white will-change-transform cursor-pointer"
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      onClick={handleTap}
    >
      <Link
        href={`/videos/${id}`}
        prefetch={false}
        aria-label={`Watch ${title} by ${artist}`}
        className="block w-full"
      >
        <div className="relative w-full h-52">
          {/* Shimmer & Image */}
          {!imgLoaded && shimmer}

          <Image
            src={cover || "/assets/images/placeholder_cover.jpg"}
            alt={title}
            fill
            className={`object-cover rounded-2xl transition-opacity duration-500 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
            loading="lazy"
            unoptimized={cover.startsWith("blob:")}
          />

          {/* Video overlay (fade in when playing) */}
          {videoReady && (
            <video
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className={`absolute inset-0 w-full h-full object-cover rounded-2xl transition-opacity duration-700 ${
                isPlaying ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* Category tag */}
          {category && (
            <div className="absolute -bottom-1 left-0 bg-black text-white text-sm px-2 py-0.5 md:py-1 shadow-lg rounded-tr-lg">
              <h3 className="font-semibold tracking-tight uppercase">
                {category}
              </h3>
            </div>
          )}
        </div>

        <div className="pl-2 pr-3 py-3 space-y-1.5">
          <div>
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600 truncate">{artist}</p>
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
      </Link>

      {/* Small hint for touch devices */}
      {isTouchDevice && (
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md">
          {isPlaying ? "Tap to Stop Preview" : "Tap to Preview"}
        </div>
      )}
    </motion.div>
  );
}
