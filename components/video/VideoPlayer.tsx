"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Heart,
  Share2,
  Flame,
  Laugh,
  Smile,
  Eye,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { incrementInteraction } from "@/actions/getItemsWithStats";

interface SocialVideoPlayerProps {
  src: string;
  title: string;
  thumbnail?: string;
  id: string;
  userId?: string;
  initialLikes?: number;
  initialViews?: number;
  initialShares?: number;
}

export default function VideoPlayer({
  src,
  title,
  thumbnail,
  id,
  userId,
  initialLikes = 0,
  initialViews = 0,
  initialShares = 0,
}: SocialVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [likes, setLikes] = useState(initialLikes);
  const [views, setViews] = useState(initialViews);
  const [shareCount, setShareCount] = useState(initialShares);
  const [showReactions, setShowReactions] = useState(false);
  const [liked, setLiked] = useState(false);

  // ✅ Handle Interactions
  const handleInteraction = useCallback(
    async (type: "like" | "share") => {
      if (!userId) return alert("Please sign in to interact.");
      try {
        if (type === "like") {
          setLiked((v) => !v);
          setLikes((n) => (liked ? Math.max(0, n - 1) : n + 1));
        } else if (type === "share") {
          setShareCount((n) => n + 1);
        }
        await incrementInteraction(id, "Video", type, userId);
      } catch (err) {
        console.error(err);
      }
    },
    [id, userId, liked]
  );

  // ✅ Play & Controls
  const togglePlay = () => {
    if (!videoRef.current || !userId) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // ✅ Video Progress & Time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const update = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration);
      setProgress((video.currentTime / video.duration) * 100 || 0);
    };

    const onPlay = () => {
      if (userId) {
        setViews((v) => v + 1);
        incrementInteraction(id, "Video", "view", userId);
      }
    };

    video.addEventListener("timeupdate", update);
    video.addEventListener("loadedmetadata", update);
    video.addEventListener("play", onPlay);

    return () => {
      video.removeEventListener("timeupdate", update);
      video.removeEventListener("loadedmetadata", update);
      video.removeEventListener("play", onPlay);
    };
  }, [id, userId]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = (Number(e.target.value) / 100) * duration;
    video.currentTime = newTime;
    setProgress(Number(e.target.value));
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  // Auto-hide overlay when playing
  useEffect(() => {
    if (!isPlaying) return;
    const timeout = setTimeout(() => setShowOverlay(false), 2500);
    return () => clearTimeout(timeout);
  }, [isPlaying]);

  return (
    <div
      className="relative w-full overflow-hidden bg-black shadow-xl rounded-md aspect-[16/9] sm:aspect-video"
      onMouseMove={() => setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={thumbnail}
        className="w-full h-full object-contain sm:object-cover bg-black"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        playsInline
        controls={false}
      />

      {/* ✅ LOGIN OVERLAY if no user */}
      {!userId && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 text-white z-20">
          <LogIn size={40} className="opacity-80" />
          <p className="text-sm sm:text-base">Sign in to play and react to videos</p>
        </div>
      )}

      {/* ✅ Overlay UI */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 sm:p-5"
          >
            {/* Top: Title */}
            <div className="text-white text-xs sm:text-sm font-medium truncate drop-shadow-md">
              {title}
            </div>

            {/* Bottom: Controls */}
            <div className="flex flex-col gap-2 sm:gap-3">
              {/* Progress Bar */}
              <div className="flex items-center gap-2 text-white text-[10px] sm:text-sm">
                <span>{formatTime(currentTime)}</span>
                <input
                  aria-label="range"
                  type="range"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={handleSeek}
                  className="flex-1 accent-white h-1 cursor-pointer rounded-full"
                  disabled={!userId}
                />
                <span>{formatTime(duration)}</span>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 pb-1">
                <Button
                  onClick={togglePlay}
                  disabled={!userId}
                  variant="ghost"
                  size="icon"
                  className="bg-white/10 hover:bg-white/20 rounded-full text-white"
                >
                  {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                </Button>

                <Button
                  onClick={toggleMute}
                  variant="ghost"
                  size="icon"
                  className="bg-white/10 hover:bg-white/20 rounded-full text-white"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </Button>

                <Button
                  onClick={toggleFullscreen}
                  variant="ghost"
                  size="icon"
                  className="bg-white/10 hover:bg-white/20 rounded-full text-white"
                >
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Social Reactions (only if logged in) */}
      {userId && (
        <>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-3 bottom-12 flex flex-col items-center gap-4 text-white sm:right-5 sm:bottom-16"
          >
            <button
              onClick={() => handleInteraction("like")}
              className="flex flex-col items-center gap-1 hover:scale-110 transition"
            >
              <Heart
                className={`drop-shadow-lg ${liked ? "text-pink-500" : "text-white/80"}`}
                fill={liked ? "currentColor" : "none"}
                size={26}
              />
              <span className="text-xs">{likes}</span>
            </button>

            <button
              onClick={() => setShowReactions(!showReactions)}
              className="flex flex-col items-center gap-1 hover:scale-110 transition"
            >
              <Flame size={26} className="text-orange-400" />
              <span className="text-xs">React</span>
            </button>

            <button
              onClick={() => handleInteraction("share")}
              className="flex flex-col items-center gap-1 hover:scale-110 transition"
            >
              <Share2 size={22} />
              <span className="text-xs">{shareCount}</span>
            </button>

            <div className="flex flex-col items-center text-xs opacity-80">
              <Eye size={20} />
              <span>{views}</span>
            </div>
          </motion.div>

          {/* Reaction Popup */}
          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute bottom-28 right-4 sm:bottom-32 bg-black/70 backdrop-blur-md rounded-xl p-2 flex gap-3"
              >
                {[Flame, Laugh, Smile].map((Icon, i) => (
                  <Icon
                    key={i}
                    className="text-yellow-400 cursor-pointer hover:scale-125 transition"
                    size={24}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
