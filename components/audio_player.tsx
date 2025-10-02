"use client";
import React, { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from "react";
import { Play, Pause, Music, Headphones, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";
import { Track } from "@/data/types";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";

const usePlayCount = (trackId: number) => {
  const key = `olios:plays:${trackId}`;
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const existing = Number(localStorage.getItem(key) || 0);
    if (!Number.isNaN(existing)) setCount(existing);
  }, [key]);

  const increment = async () => {
    const next = count + 1;
    setCount(next);
    localStorage.setItem(key, String(next));
    try {
      await fetch("/api/plays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId, delta: 1 }),
      });
    } catch {}
  };

  return { count, increment };
};

interface PlayerProps {
  ref: RefObject<HTMLAudioElement>;
  track: Track;
  currentTrackId: number;
  playTrack: (id: number, src: string) => void;
  isPlaying: boolean;
}

const AudioPlayer = ({ ref, track , currentTrackId, playTrack, isPlaying}: PlayerProps) => {
// const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
  const dispatch = useDispatch();

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState<number | undefined>(track.duration);
  const { count, increment } = usePlayCount(1);

  const [playCount, setPlayCount] = useState<number>(0)
  const key = `olios:plays:${track._id}`;

    useEffect(() => {
    const existing = Number(localStorage.getItem(key) || 0);
    if (!Number.isNaN(existing)) setPlayCount(existing);
  }, [key]);

 const newCount = () => {
  const next = playCount + 1;
    setPlayCount(next);
    localStorage.setItem(key, String(next));
 }

  useEffect(() => {
    const a = ref.current;
    
    if (!a) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => {
      setCurrent(a.currentTime);
      if (currentTrackId === Number(track._id) && a.duration) setProgress(a.currentTime / a.duration);
    };
    const onLoaded = () => {
      if (currentTrackId === Number(track._id) && a.duration && !Number.isNaN(a.duration)) setDuration(a.duration);
    };
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
      setCurrent(0);
      increment();
    };
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("ended", onEnded);
    localStorage.getItem(key);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("ended", onEnded);
    };
  }, [increment, track._id, dispatch, currentTrackId, ref, key]);

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = ref.current;
    if (!a || !duration) return;
    const pct = Number(e.target.value);
    a.currentTime = pct * duration;
  };

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-900/70 via-neutral-900/70 to-zinc-900/70 text-white backdrop-blur-xl shadow-xl">
  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
    {/* LEFT: Cover + Title */}
    <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
      <div className="h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-lg sm:rounded-xl border border-white/10 bg-white/5 shrink-0">
        {track.coverUrl ? (
          <img src={track.coverUrl} alt={track.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center opacity-70">
            <Music className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <CardTitle className="text-sm sm:text-md md:text-lg font-semibold tracking-tight truncate">
          {track.title}
        </CardTitle>
        <p className="text-xs sm:text-sm text-white/70 truncate">{track.artist}</p>
      </div>
    </div>

    {/* RIGHT: Badge */}
    <Badge
      variant="secondary"
      className="self-start sm:self-center bg-white/10 text-white/90 backdrop-blur text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1"
    >
      <Headphones className="mr-1 h-3 w-3" /> {playCount}
    </Badge>
  </CardHeader>

  <CardContent>
    <div className="flex flex-row items-center gap-3 sm:gap-4">
      {/* Play Button */}
      <Button
        onClick={() => {
          playTrack(Number(track._id), track.url);
          newCount();
        }}
        className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl shadow-lg shrink-0 bg-white/10"
      >
        {currentTrackId === Number(track._id) && isPlaying ? (
          <Pause className="h-4 w-4 sm:h-5 sm:w-5 " />
        ) : (
          <Play className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </Button>

      {/* Progress + Time */}
      <div className="flex-1 w-full">
        <input
          aria-label="progress-range"
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={progress}
          disabled={currentTrackId !== Number(track._id)}
          onChange={onSeek}
          className="w-full accent-white"
        />
        <div className="mt-1 flex justify-between text-[10px] sm:text-xs text-white/70">
          <span>{currentTrackId === Number(track._id) && formatTime(current)}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 inline" />
            {formatTime(duration ?? 0)}
          </span>
        </div>
      </div>
    </div>

    <audio ref={ref} src={track.url} preload="metadata" />
  </CardContent>
</Card>

  );
}

export default AudioPlayer;