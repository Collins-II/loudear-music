"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/index";
import { play, pause, setVolume } from "@/lib/store/audioSlice";
import { useRef, useEffect, useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

export default function GlobalAudioPlayer() {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, volume } = useSelector(
    (s: RootState) => s.audio
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // local UI states for progress & duration
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // sync redux state → audio element
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;

    if (isPlaying) {
      a.play().catch(() => {});
    } else {
      a.pause();
    }
  }, [isPlaying, volume, currentTrack]);

  // attach listeners
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onTime = () => setProgress(a.currentTime);
    const onLoaded = () => setDuration(a.duration);

    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoaded);

    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onLoaded);
    };
  }, []);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-lg border-t border-gray-800 px-6 py-3 flex items-center gap-4">
      <audio ref={audioRef} src={currentTrack} preload="metadata" />

      {/* Info */}
      <div className="flex-1 flex items-center justify-center gap-4">
        <button
          onClick={() => dispatch(isPlaying ? pause() : play())}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
        >
          {isPlaying ? <Pause className="text-white" /> : <Play className="text-white" />}
        </button>

        {/* Seekbar */}
        <div className="w-2/5 flex items-center gap-2">
          <input
            aria-label="range"
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={progress}
            onChange={(e) => {
              const newTime = Number(e.target.value);
              if (audioRef.current) {
                audioRef.current.currentTime = newTime;
              }
              setProgress(newTime);
            }}
            className="w-full accent-indigo-500"
          />
          <span className="text-xs text-gray-400 min-w-[80px] text-right">
            {Math.floor(progress)}s / {Math.floor(duration)}s
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-gray-300" />
        <input
          aria-label="range"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => dispatch(setVolume(Number(e.target.value)))}
          className="w-24 accent-indigo-500"
        />
      </div>
    </div>
  );
}
