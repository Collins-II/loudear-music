"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, DownloadCloud, VolumeX } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface CustomPlayerProps {
  src: string;
  title: string;
  artist: string;
  coverUrl?: string;
  onDownload?: () => void;
}

export default function CustomPlayer({
  src,
  title,
  artist,
  coverUrl,
  onDownload,
}: CustomPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  // --- Update progress and waveform ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateProgress);
    };
  }, []);

  // --- Draw simple sine wave progress bar ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#fff";

    const waveAmplitude = 4;
    const waveFrequency = 0.04;
    const offset = progress / 5;

    ctx.beginPath();
    for (let x = 0; x < width; x++) {
      const y =
        height / 2 +
        Math.sin((x + offset * 20) * waveFrequency) * waveAmplitude;
      ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill progress
    ctx.fillStyle = "#fff";
    ctx.globalAlpha = 0.1;
    ctx.fillRect(0, 0, (progress / 100) * width, height);
    ctx.globalAlpha = 1;
  }, [progress]);

    const applyVolume = useCallback(() => {
      if (audioRef.current) {
        audioRef.current.volume = volume;
        audioRef.current.muted = muted;
      }
    }, [volume, muted]);
  
    useEffect(() => applyVolume(), [applyVolume]);

  const toggleMute = () => setMuted((m) => !m);
  // --- Controls ---
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const value = parseFloat(e.target.value);
    audio.currentTime = (value / 100) * audio.duration;
    setProgress(value);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const value = parseFloat(e.target.value);
    audio.volume = value;
    setVolume(value);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const safeFilename = (name: string) =>
    name.replace(/[<>:"/\\|?*]+/g, "").trim();
  const downloadFileName = `${safeFilename(artist)} - ${safeFilename(title)}.mp3`;

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error("Failed to fetch audio file");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      onDownload?.();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full rounded-3xl bg-white border-[3px] border-black text-black p-5 flex flex-col sm:flex-row gap-5 items-center"
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Album Art */}
      <div className="relative w-28 h-28 sm:w-24 sm:h-24 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
        <Image
          src={coverUrl || "/assets/images/placeholder_cover.jpg"}
          alt={`${title} cover`}
          fill
          className="object-cover"
        />
      </div>

      {/* Info + Controls */}
      <div className="flex-1 flex flex-col justify-between w-full">
        <div className="flex flex-col text-center sm:text-left mb-2">
          <span className="text-base font-semibold tracking-wide">{title}</span>
          <span className="text-sm text-gray-600">{artist}</span>
        </div>

        {/* Wave Progress */}
        <div className="relative w-full h-8 mt-1">
          <canvas
            ref={canvasRef}
            width={600}
            height={30}
            className="w-full h-full rounded-md bg-neutral-900"
          />
          <input
            aria-label="Seek track"
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={handleSeek}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        {/* Playback Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <Button
              onClick={togglePlay}
              size="icon"
              className="bg-black/20 text-black hover:bg-gray-500 rounded-full p-2 transition"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>

            <div className="flex items-center gap-2 text-xs text-gray-600 font-mono">
              <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
                    <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="border border-black hover:bg-black hover:text-white rounded-full"
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>

        <input
          aria-label="range"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={handleVolume}
          className="w-32 accent-black"
        />

            <Button
              size="icon"
              onClick={handleDownload}
              className="bg-black/10 hover:bg-black/20 rounded-full p-2 border border-black/10"
              aria-label="Download"
            >
              <DownloadCloud className="w-4 h-4 text-black" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
