"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Download, DownloadCloud } from "lucide-react";
import Image from "next/image";

interface CustomPlayerProps {
  src: string;
  title: string;
  artist: string;
  coverUrl?: string;
  onDownload: () => void;
}

export default function CustomPlayer({
  src,
  title,
  artist,
  coverUrl,
  onDownload,
}: CustomPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Sync progress with audio
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
    name.replace(/[<>:"/\\|?*]+/g, "").trim(); // sanitize for FS

  const downloadFileName = `${safeFilename(artist)} - ${safeFilename(title)}.mp3`;

const handleDownload = async () => {
  try {
    const response = await fetch(src);
    if (!response.ok) throw new Error("Failed to fetch audio file");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = downloadFileName; // ✅ dynamic filename
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
    if(onDownload) onDownload()
  } catch (err) {
    console.error("Download failed:", err);
  }
};


  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center gap-4 w-full">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Album Art */}
      <div className="relative w-full sm:w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden shadow-md mx-auto sm:mx-0">
        <Image
          src={coverUrl || "/assets/images/placeholder_cover.jpg"}
          alt={`${title} cover`}
          fill
          className="object-cover"
        />
      </div>

      {/* Track Info + Controls */}
      <div className="flex-1 flex flex-col gap-2">
        {/* Track Info */}
        <div className="flex flex-col items-center sm:items-start">
          <span className="text-sm font-semibold truncate w-full">{title}</span>
          <span className="text-xs text-gray-400 truncate w-full">{artist}</span>
        </div>

        {/* Playback Controls */}
        <div className="flex flex-row sm:items-center gap-2">
          {/* Play/Pause */}
          <Button
            size="icon"
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={togglePlay}
            className="bg-white text-black hover:text-white rounded-full p-2 hover:scale-105 transition mx-auto sm:mx-0"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </Button>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-[11px] text-gray-300 hidden sm:block">
              {formatTime(audioRef.current?.currentTime || 0)}
            </span>
            <input
              aria-label="Track progress"
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={handleSeek}
              className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <span className="text-[11px] text-gray-300 hidden sm:block">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Volume + Download */}
      <div className="flex items-center justify-between sm:justify-end gap-4">
        {/* Volume Control */}
        <div className="hidden md:block flex items-center gap-1">
          <Volume2 className="w-4 h-4 text-gray-300 hidden sm:block" />
          <input
            aria-label="Volume"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolume}
            className="w-full accent-green-500 cursor-pointer"
          />
        </div>

        {/* Download Button */}

          <Button
            size="icon"
            className="bg-green-500 hover:bg-green-600 rounded-full p-2"
            onClick={handleDownload}
          >
            <DownloadCloud className="w-4 h-4" />
          </Button>
      </div>
    </div>
  );
}
