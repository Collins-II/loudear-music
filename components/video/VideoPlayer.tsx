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
  Settings,
  Subtitles,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { incrementInteraction } from "@/actions/getItemsWithStats";
import Image from "next/image";

interface VideoPlayerProps {
  id: string;
  title: string;
  thumbnail?: string;
  userId?: string;
  hoverThumbnails?: string[];
  sources: { label: string; src: string; bitrate?: number }[]; // bitrate optional for auto
  subtitles?: { label: string; src: string }[];
}

export default function VideoPlayer({
  id,
  title,
  thumbnail,
  userId,
  hoverThumbnails = [],
  sources,
  subtitles = [],
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasCountedView, setHasCountedView] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [currentSource, setCurrentSource] = useState(sources[0]);
  const [showSubtitles, setShowSubtitles] = useState(false);

  const video = videoRef.current;

  /* ---------------------------- Controls ---------------------------- */
  const togglePlay = useCallback(() => {
    if (!video || !userId) return;
    if (isPlaying) video.pause();
    else video.play();
  }, [isPlaying, userId, video]);

  const toggleMute = useCallback(() => {
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  },[isMuted, video]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!video) return;
    const value = Number(e.target.value);
    video.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const changePlaybackRate = (rate: number) => {
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const switchQuality = useCallback((source: { label: string; src: string }) => {
    if (!video) return;
    const currentTimeBackup = video.currentTime;
    const isPaused = video.paused;
    setCurrentSource(source);
    video.src = source.src;
    video.currentTime = currentTimeBackup;
    if (!isPaused) video.play();
  },[video]);

  const toggleSubtitles = () => {
    if (!video) return;
    for (let i = 0; i < video.textTracks.length; i++) {
      video.textTracks[i].mode = showSubtitles ? "disabled" : "showing";
    }
    setShowSubtitles(!showSubtitles);
  };

  /* ----------------------- Video Events ----------------------- */
  useEffect(() => {
    if (!video) return;

    const updateProgress = () => {
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

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleView);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleView);
    };
  }, [video, id, userId, hasCountedView]);

  /*const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!video) return;
    const newTime = (Number(e.target.value) / 100) * duration;
    video.currentTime = newTime;
    setProgress(Number(e.target.value));
  };*/

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  /* -------------------- Hover Preview -------------------- */
  const handleHoverProgress = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!video) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setHoverTime(percent * duration);
  };

  const clearHover = () => setHoverTime(null);

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
      else if (e.key === "ArrowRight") {
        if (video) video.currentTime += 5;
      } else if (e.key === "ArrowLeft") {
        if (video) video.currentTime -= 5;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [togglePlay, toggleMute, video]);

  /* -------------------- Auto-Resolution Switching -------------------- */
  useEffect(() => {
    const connection = (navigator as any).connection;

    if (!connection || sources.length < 2) return;

    const handleConnectionChange = () => {
      const speed = connection.downlink; // Mbps
      let bestSource = sources[0];
      if (speed > 5 && sources.find((s) => s.label === "1080p")) bestSource = sources.find((s) => s.label === "1080p")!;
      else if (speed > 2 && sources.find((s) => s.label === "720p")) bestSource = sources.find((s) => s.label === "720p")!;
      else if (sources.find((s) => s.label === "360p")) bestSource = sources.find((s) => s.label === "360p")!;
      if (bestSource.src !== currentSource.src) switchQuality(bestSource);
    };

    connection.addEventListener("change", handleConnectionChange);
    handleConnectionChange(); // initial check

    return () => connection.removeEventListener("change", handleConnectionChange);
  }, [sources, currentSource, switchQuality]);

  /* --------------------------- Component --------------------------- */
  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-xl border border-white/10"
      onMouseMove={() => setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
    >
      <video
        ref={videoRef}
        src={currentSource.src}
        poster={thumbnail}
        onClick={togglePlay}
        playsInline
        controls={false}
        className="w-full h-full object-cover cursor-pointer"
      >
        {subtitles.map((sub, idx) => (
          <track key={idx} label={sub.label} src={sub.src} kind="subtitles" default={idx === 0} />
        ))}
      </video>

      {!userId && (
        <div className="absolute inset-0 z-20 bg-black/70 flex flex-col items-center justify-center text-white gap-3">
          <LogIn size={40} />
          <p className="text-sm">Sign in to watch and interact</p>
        </div>
      )}

      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 text-white transition-opacity"
          >
            {/* Top Bar */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-sm font-semibold">
              {title}
              <div className="relative">
                <Button
                  onClick={() => setShowSettings(!showSettings)}
                  variant="ghost"
                  size="icon"
                  className="text-white"
                >
                  <Settings size={20} />
                  <ChevronDown size={14} className={`${showSettings ? "rotate-180" : ""} transition-transform`} />
                </Button>

                {showSettings && (
                  <div className="absolute right-0 mt-2 w-40 bg-black/90 border border-white/20 rounded shadow-lg p-2 flex flex-col gap-2 z-50">
                    <label className="flex justify-between text-xs">
                      Speed
                      <select
                        value={playbackRate}
                        onChange={(e) => changePlaybackRate(Number(e.target.value))}
                        className="bg-black/80 text-white text-xs rounded px-1 py-0.5"
                      >
                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                          <option key={rate} value={rate}>
                            {rate}x
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="flex justify-between text-xs">
                      Quality
                      <select
                        value={currentSource.label}
                        onChange={(e) =>
                          switchQuality(sources.find((s) => s.label === e.target.value)!)
                        }
                        className="bg-black/80 text-white text-xs rounded px-1 py-0.5"
                      >
                        {sources.map((s) => (
                          <option key={s.label} value={s.label}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    {subtitles.length > 0 && (
                      <button
                        onClick={toggleSubtitles}
                        className={`text-left text-xs ${showSubtitles ? "text-red-500" : "text-white"}`}
                      >
                        <Subtitles size={16} className="inline mr-1" />
                        Subtitles
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex flex-col gap-2">
              <div
                className="relative w-full h-1 bg-white/20 cursor-pointer"
                onMouseMove={handleHoverProgress}
                onMouseLeave={clearHover}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  if (video) video.currentTime = percent * duration;
                }}
              >
                <motion.div className="absolute top-0 left-0 h-full bg-red-600" style={{ width: `${progress}%` }} />
                {hoverTime !== null && hoverThumbnails.length > 0 && (
                  <motion.div
                    className="relative absolute -top-20 w-32 h-18"
                    style={{
                      left: `${Math.min(Math.max((hoverTime / duration) * 100, 0), 100)}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <Image
                      src={hoverThumbnails[Math.floor((hoverTime / duration) * hoverThumbnails.length)]}
                      alt="preview"
                      fill
                      className="w-full h-full object-cover rounded-md border border-white/20"
                    />
                  </motion.div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={togglePlay}
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

                  <input
                    aria-label="input-range"
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 cursor-pointer accent-red-600"
                  />

                  <span className="text-xs">{formatTime(currentTime)}</span>
                  <span className="text-xs">/ {formatTime(duration)}</span>
                </div>

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
