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
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { incrementInteraction } from "@/actions/getItemsWithStats";

interface VideoPlayerProps {
  id: string;
  src: string;
  title: string;
  thumbnail?: string;
  userId?: string;
  initialViews?: number;
  initialLikes?: number;
  initialShares?: number;
}

export default function VideoPlayer({
  id,
  src,
  title,
  thumbnail,
  userId,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasCountedView, setHasCountedView] = useState(false);

  /* ---------------------------- Controls ---------------------------- */
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !userId) return;
    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }, [isPlaying, userId]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  },[isMuted]);

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

  /* ----------------------- View + Interaction ----------------------- */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const update = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration);
      setProgress((video.currentTime / video.duration) * 100 || 0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleView = () => {
      if (userId && !hasCountedView && video.currentTime > 2) {
        incrementInteraction(id, "Video", "view", userId);
        setHasCountedView(true);
      }
    };

    video.addEventListener("timeupdate", update);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleView);

    return () => {
      video.removeEventListener("timeupdate", update);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleView);
    };
  }, [id, userId, hasCountedView]);

  /* ---------------------------- Utilities --------------------------- */
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

  /* ----------------------- Overlay Auto-Hide ----------------------- */
  useEffect(() => {
    if (!isPlaying) return;
    const timeout = setTimeout(() => setShowOverlay(false), 2500);
    return () => clearTimeout(timeout);
  }, [isPlaying]);

  /* ---------------------- Keyboard Shortcuts ---------------------- */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "m") toggleMute();
      else if (e.key === "f") toggleFullscreen();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [togglePlay, toggleMute]);

  /* --------------------------- Component --------------------------- */
  return (
    <div
      className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-xl border border-white/10`}
      onMouseMove={() => setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={thumbnail}
        onClick={togglePlay}
        playsInline
        controls={false}
        className="w-full h-full object-contain bg-black cursor-pointer"
      />

      {/* Overlay: login prompt */}
      {!userId && (
        <div className="absolute inset-0 z-20 bg-black/70 flex flex-col items-center justify-center text-white gap-3">
          <LogIn size={40} />
          <p className="text-sm">Sign in to watch and interact</p>
        </div>
      )}

      {/* Controls Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 text-white"
          >
            {/* Top Section */}
            <div className="text-sm sm:text-base font-semibold">{title}</div>

            {/* Bottom Section */}
            <div className="space-y-3">
              {/* Progress Bar */}
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span>{formatTime(currentTime)}</span>
                <input
                  aria-label="range"
                  type="range"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={handleSeek}
                  disabled={!userId}
                  className="flex-1 cursor-pointer accent-white"
                />
                <span>{formatTime(duration)}</span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-6">
                <Button
                  onClick={togglePlay}
                  disabled={!userId}
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </Button>

                <Button
                  onClick={toggleMute}
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </Button>

                <Button
                  onClick={toggleFullscreen}
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
