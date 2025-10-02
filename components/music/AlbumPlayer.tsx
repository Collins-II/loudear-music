"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  DownloadCloud,
  Music,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Heart as HeartIcon,
} from "lucide-react";
import Image from "next/image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { SongSerialized } from "@/actions/getSongById";

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

  // queues
  const [queue, setQueue] = useState<SongSerialized[]>(tracks);
  const [shuffledQueue, setShuffledQueue] = useState<SongSerialized[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const activeQueue = shuffledQueue ?? queue;
  const currentTrack = activeQueue[currentIndex] || null;

  // playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolume] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const v = localStorage.getItem("player_volume");
      return v ? Number(v) : 1;
    }
    return 1;
  });
  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("player_muted") === "true";
    }
    return false;
  });

  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

  // likes state
  const [likesMap, setLikesMap] = useState<Record<string, number>>(() =>
    tracks.reduce((acc, t) => {
      acc[t._id] = t.likeCount ?? 0;
      return acc;
    }, {} as Record<string, number>)
  );
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>(() =>
    tracks.reduce((acc, t) => {
      acc[t._id] = !!(t as any).userLiked;
      return acc;
    }, {} as Record<string, boolean>)
  );

  // Apply volume
  const applyVolumeToAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
    }
  }, [volume, muted]);

  useEffect(() => {
    applyVolumeToAudio();
    localStorage.setItem("player_volume", String(volume));
    localStorage.setItem("player_muted", String(muted));
  }, [volume, muted, applyVolumeToAudio]);

  // audio listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () =>
      setProgress((audio.currentTime / (audio.duration || 1)) * 100 || 0);
    const onLoaded = () => {
      setDuration(audio.duration || 0);
      setProgress((audio.currentTime / (audio.duration || 1)) * 100 || 0);
    };
    const onEnded = () => handleTrackEnd();

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentIndex, activeQueue, repeatMode]);

  // load currentTrack
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!currentTrack) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    audio.src = currentTrack.fileUrl;
    audio.load();
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
  }, [currentTrack]); // eslint-disable-line

  // --- controls ---
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (pct: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = (pct / 100) * audio.duration;
    setProgress(pct);
  };

const nextTrack = () => {
  if (!currentTrack) return;

  if (repeatMode === "one" && audioRef.current) {
    // restart same track
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    return;
  }

  const nextIdx = currentIndex + 1;

  if (nextIdx < activeQueue.length) {
    setCurrentIndex(nextIdx);
  } else {
    // ✅ Always loop back to first track (infinite)
    setCurrentIndex(0);

    if (repeatMode === "off") {
      // autoplay only if repeat is not "off"
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }
};


  const prevTrack = () => {
    if (activeQueue.length === 0) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : activeQueue.length - 1));
  };

  const handleTrackEnd = () => nextTrack();

  const toggleShuffle = () => {
    setShuffle((s) => {
      const newS = !s;
      if (newS) {
        const arr = [...queue];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        const curId = currentTrack?._id;
        let idx = arr.findIndex((x) => x._id === curId);
        if (idx === -1 && curId) {
          arr.unshift(queue.find((t) => t._id === curId)!);
          idx = 0;
        }
        setShuffledQueue(arr);
        setCurrentIndex(idx >= 0 ? idx : 0);
      } else {
        const curId = currentTrack?._id;
        const idx = queue.findIndex((t) => t._id === curId);
        setShuffledQueue(null);
        setCurrentIndex(idx >= 0 ? idx : 0);
      }
      return newS;
    });
  };

  const shuffleTracklist = () => {
    setQueue((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
  };

  const toggleRepeat = () =>
    setRepeatMode((prev) => (prev === "off" ? "all" : prev === "all" ? "one" : "off"));

  const toggleMute = () => setMuted((m) => !m);
  const handleVolumeChange = (val: number) => setVolume(val);

  const downloadTrack = async (track: SongSerialized) => {
    if (!track?.fileUrl) return;
    try {
      const res = await fetch(track.fileUrl);
      if (!res.ok) throw new Error("Fetch failed");
      const blob = await res.blob();
      saveAs(blob, `${track.artist} - ${track.title}.mp3`);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const downloadAlbum = async () => {
    const zip = new JSZip();
    for (const track of queue) {
      try {
        const res = await fetch(track.fileUrl);
        const blob = await res.blob();
        zip.file(`${track.artist} - ${track.title}.mp3`, blob);
      } catch {}
    }
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${albumArtist} - ${albumTitle}.zip`);
  };

  const toggleLike = async (track: SongSerialized) => {
    if (!userId) {
      alert("Please sign in to like tracks.");
      return;
    }
    const id = track._id;
    const currentlyLiked = !!userLiked[id];
    setUserLiked((p) => ({ ...p, [id]: !currentlyLiked }));
    setLikesMap((p) => ({ ...p, [id]: (p[id] || 0) + (currentlyLiked ? -1 : 1) }));

    try {
      const res = await fetch("/api/interactions/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, model: "Song", userId }),
      });
      if (!res.ok) throw new Error("like failed");
    } catch {
      setUserLiked((p) => ({ ...p, [id]: currentlyLiked }));
      setLikesMap((p) => ({ ...p, [id]: (p[id] || 0) + (currentlyLiked ? 1 : -1) }));
    }
  };

  const formatTime = (t: number) => {
    if (!t || isNaN(t)) return "0:00";
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div
      className={`bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col gap-6 ${className}`}
    >
      <audio ref={audioRef} preload="metadata" />

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="relative rounded-lg overflow-hidden shadow-md w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48">
          <Image
            src={coverUrl ?? "/assets/images/placeholder_cover.jpg"}
            alt={`${albumTitle} cover`}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold">{albumTitle}</h3>
          <p className="text-sm text-gray-300">{albumArtist}</p>

          {/* Playback Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-6">
            <Button variant="ghost" size="icon" onClick={prevTrack} className="text-gray-300 hover:text-white">
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              onClick={togglePlay}
              className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={nextTrack} className="text-gray-300 hover:text-white">
              <SkipForward className="w-5 h-5" />
            </Button>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs text-gray-300 hidden sm:block">
                {formatTime(audioRef.current?.currentTime ?? 0)}
              </span>
              <input
                aria-label="progress"
                type="range"
                min={0}
                max={100}
                value={isNaN(progress) ? 0 : Math.max(0, Math.min(100, progress))}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="flex-1 h-1 accent-green-500 cursor-pointer"
              />
              <span className="text-xs text-gray-300 hidden sm:block">{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={shuffleTracklist}
          className={`${shuffle ? "text-green-400" : "text-gray-400"} hover:text-white`}
        >
          <Shuffle className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleRepeat}
          className={`${repeatMode !== "off" ? "text-green-400" : "text-gray-400"} hover:text-white relative`}
        >
          <Repeat className="w-5 h-5" />
          {repeatMode === "one" && (
            <span className="absolute right-1 top-1 text-[10px] font-bold text-green-300">1</span>
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleMute} className="text-gray-400 hover:text-white">
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
        <input
          aria-label="volume"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={(e) => handleVolumeChange(Number(e.target.value))}
          className="w-16 sm:w-24 md:w-32 lg:w-40 accent-green-500"
        />
        <button
          aria-label="download"
          onClick={downloadAlbum}
          className="text-gray-300 hover:text-white p-1 flex items-center gap-1 text-sm"
        >
          <DownloadCloud className="w-4 h-4" /> <span className="hidden sm:inline">Download Album</span>
        </button>
      </div>

      {/* Tracklist */}
      <div className="bg-gray-800 rounded-xl p-2 sm:p-3 divide-y divide-gray-700 overflow-auto max-h-52 sm:max-h-60 md:max-h-72">
        {queue.map((track, idx) => {
          const id = track._id;
          const active = currentTrack?._id === id;
          return (
            <div
              key={id}
              className={`flex items-center gap-3 p-2 rounded-md ${
                active ? "bg-green-600/20" : "hover:bg-gray-700/60"
              } transition`}
            >
              <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-900 flex-shrink-0">
                <Image
                  src={track.coverUrl ?? "/assets/images/placeholder_cover.jpg"}
                  alt={track.title}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsPlaying(true);
                  }}
                  className="text-left w-full"
                >
                  <div className="flex items-center gap-2">
                    <Music
                      className={`w-4 h-4 ${active ? "text-green-400 animate-pulse" : "text-gray-400"}`}
                    />
                    <div className="truncate">
                      <div
                        className={`text-sm font-medium truncate ${
                          active ? "text-white" : "text-gray-100"
                        }`}
                      >
                        {track.title}
                      </div>
                      <div className="text-xs text-gray-400 truncate">{track.artist}</div>
                    </div>
                  </div>
                </button>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => toggleLike(track)}
                  className={`flex items-center gap-1 text-xs ${
                    userLiked[id] ? "text-pink-400" : "text-gray-300"
                  } hover:text-pink-400`}
                >
                  <HeartIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{likesMap[id] ?? 0}</span>
                </button>
                <button
                  aria-label="download"
                  onClick={() => downloadTrack(track)}
                  className="text-gray-300 hover:text-white p-1"
                >
                  <DownloadCloud className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}