"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { DownloadCloud, Eye, Loader2 } from "lucide-react";
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
  snippetLength?: number; // default 5s
}

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
  const [videoLoading, setVideoLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Detect touch devices
  useEffect(() => {
    setIsTouchDevice(window.matchMedia("(hover: none)").matches);
  }, []);

  // Prepare video preload
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => setVideoLoading(true);
    const handleLoadedData = () => setVideoLoading(false);

    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("loadeddata", handleLoadedData);

    return () => {
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("loadeddata", handleLoadedData);
    };
  }, []);

  // Snippet playback logic
  const playSnippet = async () => {
    const video = videoRef.current;
    if (!video) return;

    // wait until the video can play
    if (video.readyState < 2) {
      await new Promise<void>((resolve) => {
        const ready = () => {
          video.removeEventListener("loadeddata", ready);
          resolve();
        };
        video.addEventListener("loadeddata", ready);
      });
    }

    // ✅ generate random start on every hover
    const randomStart = Math.random() * Math.max(0, video.duration - snippetLength - 0.1);
    video.currentTime = randomStart;

    video.muted = true;
    video.playsInline = true;

    try {
      await video.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }

    // loop only the snippet
    const handleTimeUpdate = () => {
      if (video.currentTime >= randomStart + snippetLength) {
        video.currentTime = randomStart;
      }
    };
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  };

  const stopSnippet = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    setIsPlaying(false);
  };

  // Hover and touch logic
  const handleHoverStart = () => {
    if (!isTouchDevice) playSnippet();
  };

  const handleHoverEnd = () => {
    if (!isTouchDevice) stopSnippet();
  };

  const handleTap = (e: React.MouseEvent) => {
    if (!isTouchDevice) return;
    e.preventDefault();
    e.stopPropagation();
    if (isPlaying) {
      stopSnippet();
    } else {
      playSnippet();
    }
  };

  return (
    <motion.div
      whileHover={!isTouchDevice ? { scale: 1.02 } : undefined}
      transition={{ type: "spring", stiffness: 220, damping: 16 }}
      className="relative w-full border-b-[4px] border-black overflow-hidden bg-white cursor-pointer"
      onPointerEnter={handleHoverStart}
      onPointerLeave={handleHoverEnd}
      onClick={handleTap}
    >
      <Link href={`/videos/${id}`} prefetch={false} aria-label={`Watch ${title} by ${artist}`} className="block w-full">
        <div className="relative w-full h-52 rounded-2xl overflow-hidden">
          {/* Placeholder shimmer */}
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-2xl" />
          )}

          {/* Cover */}
          <Image
            src={cover || "/assets/images/placeholder_cover.jpg"}
            alt={title}
            fill
            className={`object-cover transition-opacity duration-700 rounded-2xl ${
              imgLoaded && !isPlaying ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
            loading="lazy"
          />

          {/* Video */}
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            playsInline
            preload="auto"
            className={`absolute inset-0 w-full h-full object-cover rounded-2xl transition-opacity duration-700 ${
              isPlaying ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Loader */}
          {videoLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          )}

          {/* Category */}
          {category && (
            <div className="absolute -bottom-1 left-0 bg-black text-white text-sm px-2 py-0.5 md:py-1 shadow-lg rounded-tr-lg">
              <h3 className="font-semibold tracking-tight uppercase">{category}</h3>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pl-2 pr-3 py-3 space-y-1.5">
          <div>
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{title}</h3>
            <p className="text-sm text-gray-600 truncate">{artist}</p>
          </div>
          <div className="flex items-center gap-4 lg:gap-0 lg:justify-between text-xs text-gray-500 mt-2">
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

      {/* Mobile hint */}
      {isTouchDevice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md pointer-events-none"
        >
          {isPlaying ? "Tap to Stop Preview" : "Tap to Preview"}
        </motion.div>
      )}
    </motion.div>
  );
}
