"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  DownloadCloud,
  //Music,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Heart as HeartIcon,
} from "lucide-react";
import Image from "next/image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { SongSerialized } from "@/actions/getItemsWithStats";
import { Separator } from "../ui/separator";

interface AlbumPlayerProps {
  albumTitle: string;
  albumArtist: string;
  coverUrl?: string;
  tracks: SongSerialized[];
  userId?: string | null;
  className?: string;
}

type RepeatMode = "off" | "all" | "one";

export default function AlbumPlayer({
  albumTitle,
  albumArtist,
  coverUrl,
  tracks,
  userId,
  className = "",
}: AlbumPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<SongSerialized[]>(tracks);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentTrack = queue[currentIndex] || null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

  /*const [likesMap, setLikesMap] = useState<Record<string, number>>(() =>
    tracks.reduce((acc, t) => {
      acc[t._id] = t.likeCount ?? 0;
      return acc;
    }, {} as Record<string, number>)
  );*/
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>(() =>
    tracks.reduce((acc, t) => {
      acc[t._id] = !!(t as any).userLiked;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const applyVolume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
    }
  }, [volume, muted]);

  useEffect(() => applyVolume(), [applyVolume]);

  const handleTrackEnd = useCallback(() => {
    if (!audioRef.current) return;

    if (repeatMode === "one") {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) {
      setCurrentIndex(nextIndex);
    } else if (repeatMode === "all") {
      setCurrentIndex(0);
    } else {
      setIsPlaying(false);
    }
  }, [currentIndex, repeatMode, queue.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const update = () => setProgress((audio.currentTime / audio.duration) * 100 || 0);
    const loaded = () => setDuration(audio.duration || 0);
    const ended = () => handleTrackEnd();

    audio.addEventListener("timeupdate", update);
    audio.addEventListener("loadedmetadata", loaded);
    audio.addEventListener("ended", ended);

    return () => {
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("loadedmetadata", loaded);
      audio.removeEventListener("ended", ended);
    };
  }, [handleTrackEnd]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    audio.src = currentTrack.fileUrl;
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
  }, [currentTrack]); // eslint-disable-line

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      await audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const prevTrack = () => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : queue.length - 1));
  const nextTrack = () => setCurrentIndex((prev) => (prev + 1) % queue.length);

  const handleSeek = (val: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = (val / 100) * audio.duration;
    setProgress(val);
  };

  const toggleMute = () => setMuted((m) => !m);
  const toggleRepeat = () =>
    setRepeatMode((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));

  const shuffleQueue = () => {
    setQueue((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const downloadAlbum = async () => {
    const zip = new JSZip();
    for (const track of queue) {
      const res = await fetch(track.fileUrl);
      const blob = await res.blob();
      zip.file(`${track.artist} - ${track.title}.mp3`, blob);
    }
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${albumArtist} - ${albumTitle}.zip`);
  };

  const downloadTrack = async (track: SongSerialized) => {
    const res = await fetch(track.fileUrl);
    const blob = await res.blob();
    saveAs(blob, `${track.artist} - ${track.title}.mp3`);
  };

  const toggleLike = async (track: SongSerialized) => {
    if (!userId) return alert("Sign in to like songs.");
    const id = track._id;
    const liked = userLiked[id];
    setUserLiked((p) => ({ ...p, [id]: !liked }));
    //setLikesMap((p) => ({ ...p, [id]: (p[id] ?? 0) + (liked ? -1 : 1) }));
  };

  const formatTime = (t: number) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-white border-y-[3px] md:border-[3px] border-black text-black md:rounded-3xl py-6 md:p-6 flex flex-col gap-6 ${className}`}
    >
      <audio ref={audioRef} preload="metadata" />

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="relative rounded-2xl overflow-hidden border-2 border-black w-36 h-36 sm:w-44 sm:h-44">
          <Image
            src={coverUrl ?? "/assets/images/placeholder_cover.jpg"}
            alt={albumTitle}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1">
          <h3 className="capitalize text-2xl font-extrabold tracking-tight">{albumTitle}</h3>
          <p className="text-sm text-gray-700">{albumArtist}</p>

          {/* Controls */}
        <div className="flex items-start md:items-center gap-3 mt-4 flex-col md:flex-row w-full">
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevTrack}
              className="border border-black rounded-full hover:bg-black hover:text-white"
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              onClick={togglePlay}
              size="icon"
              className="bg-black text-white hover:bg-gray-800 rounded-full p-3"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextTrack}
              className="border border-black rounded-full hover:bg-black hover:text-white"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs">{formatTime(audioRef.current?.currentTime ?? 0)}</span>
              <input
                aria-label="range"
                type="range"
                min={0}
                max={100}
                value={isNaN(progress) ? 0 : Math.max(0, Math.min(100, progress))}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="flex-1 h-1 accent-black cursor-pointer w-full"
              />
              <span className="text-xs">{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>
      <Separator className="flex md:hidden" />
      {/* Bottom Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={shuffleQueue}
          className="border border-black hover:bg-black hover:text-white rounded-full"
        >
          <Shuffle className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleRepeat}
          className="border border-black hover:bg-black hover:text-white rounded-full relative"
        >
          <Repeat className="w-5 h-5" />
          {repeatMode === "one" && (
            <span className="absolute top-1 right-1 text-[10px] font-bold">1</span>
          )}
        </Button>

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
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-32 accent-black"
        />

        <Button
          onClick={downloadAlbum}
          className="bg-black text-white rounded-full px-3 hover:bg-gray-800"
        >
          <DownloadCloud className="w-4 h-4 mr-2" /> Download Album
        </Button>
      </div>

      {/* Tracklist */}
      <div className="bg-neutral-100 rounded-2xl border border-black/20 p-3 divide-y divide-black/10 max-h-64 overflow-auto">
        {queue.map((track, idx) => {
          const active = currentTrack?._id === track._id;
          return (
            <div
              key={track._id}
              className={`flex items-center gap-3 p-2 rounded-md transition ${
                active ? "bg-black text-white" : "hover:bg-black/5"
              }`}
            >
              <div className="w-10 h-10 rounded-md overflow-hidden border border-black/20 flex-shrink-0">
                <Image
                  src={track.coverUrl ?? "/assets/images/placeholder_cover.jpg"}
                  alt={track.title}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <button
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsPlaying(true);
                }}
                className="flex-1 text-left"
              >
                <div className="text-sm font-semibold truncate">{track.title}</div>
                <div className="text-xs text-gray-500 truncate">{track.artist}</div>
              </button>
              <div className="flex items-center gap-2">
                <button
                  aria-label="action-buttons"
                  onClick={() => toggleLike(track)}
                  className={`${
                    userLiked[track._id] ? "text-red-500" : "text-gray-700"
                  } hover:text-red-500`}
                >
                  <HeartIcon className="w-4 h-4" />
                </button>
                <button
                  aria-label="action-buttons"
                  onClick={() => downloadTrack(track)}
                  className="text-gray-700 hover:text-black"
                >
                  <DownloadCloud className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
