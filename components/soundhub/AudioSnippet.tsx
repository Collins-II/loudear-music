"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadToCloudinary } from "@/lib/helpers";
import "./audio-snippet.css"; //  <-- NEW CSS FILE

async function findBest15Seconds(fileUrl: string): Promise<{ start: number; end: number }> {
  const audioCtx = new AudioContext();
  const resp = await fetch(fileUrl);
  const arrayBuf = await resp.arrayBuffer();
  const audioBuf = await audioCtx.decodeAudioData(arrayBuf);

  const channel = audioBuf.getChannelData(0);
  const sampleRate = audioBuf.sampleRate;
  const windowSize = 15 * sampleRate;

  let bestEnergy = 0;
  let bestStart = 0;

  for (let i = 0; i < channel.length - windowSize; i += sampleRate / 2) {
    let sum = 0;
    for (let j = 0; j < windowSize; j++) {
      sum += channel[i + j] ** 2;
    }
    if (sum > bestEnergy) {
      bestEnergy = sum;
      bestStart = i;
    }
  }

  const startSec = bestStart / sampleRate;
  return { start: startSec, end: startSec + 15 };
}

interface Props {
  audioUrl: string | null;
  onSnippetGenerated: (url: string) => void;
}

export default function AudioSnippet({ audioUrl, onSnippetGenerated }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  const [audioDuration, setAudioDuration] = useState(0);
  const [regionStart, setRegionStart] = useState(0);
  const [regionEnd, setRegionEnd] = useState(15);
  const [snippetUrl, setSnippetUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState<"start" | "end" | null>(null);

  useEffect(() => {
    if (!audioUrl || !audioRef.current) return;
    audioRef.current.onloadedmetadata = () => {
      setAudioDuration(audioRef.current!.duration || 30);
      setRegionStart(0);
      setRegionEnd(Math.min(15, audioRef.current!.duration));
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
  };

  // ----------------------------
  // Manual buttons for 15, 30, 60 seconds
  // ----------------------------
  const setSnippetLength = (length: number) => {
    setRegionStart(0);
    setRegionEnd(Math.min(length, audioDuration));
  };

  const autoFindBest = async () => {
    if (!audioUrl) return;
    setLoading(true);
    const { start, end } = await findBest15Seconds(audioUrl);
    setRegionStart(start);
    setRegionEnd(end);
    setLoading(false);
  };

  async function uploadBlobToCloudinary(blobUrl: string) {
    const blob = await fetch(blobUrl).then((r) => r.blob());
    const file = new File([blob], "audio.mp3", { type: blob.type || "audio/mpeg" });

    const upload = await uploadToCloudinary(file, "beats/raw", "video");
    return upload.secure_url;
  }

  const generateSnippet = async () => {
    if (!audioUrl) return alert("No audio available");

    setLoading(true);
    try {
      let processedUrl = audioUrl;

      if (audioUrl.startsWith("blob:")) {
        processedUrl = await uploadBlobToCloudinary(audioUrl);
      }

      const duration = regionEnd - regionStart;

      const res = await fetch("/api/beat/snippet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioUrl: processedUrl,
          start: regionStart,
          duration,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const json = await res.json();
      setSnippetUrl(json.secure_url);
      onSnippetGenerated(json.secure_url);
    } catch (err) {
      console.error("SNIPPET CLIENT ERROR:", err);
      alert("Error generating snippet (frontend). See console.");
    }

    setLoading(false);
  };

  const onMouseDown = (type: "start" | "end") => setDragging(type);

  const onMouseMove = (e: MouseEvent) => {
    if (!dragging || !barRef.current) return;

    const rect = barRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const time = percent * audioDuration;

    if (dragging === "start" && time < regionEnd - 1) setRegionStart(time);
    if (dragging === "end" && time > regionStart + 1) setRegionEnd(time);
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", () => setDragging(null));
    return () => window.removeEventListener("mousemove", onMouseMove);
  });

  if (!audioUrl) return null;

  return (
    <div className="space-y-4 border p-4 rounded-xl mt-6">
      <audio ref={audioRef} src={audioUrl} controls className="w-full" />

      {/* ----------------------------- */}
      {/* BUTTON ROW  */}
      {/* ----------------------------- */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button onClick={autoFindBest} variant="outline">Auto 15s</Button>

        {/* NEW MANUAL SNIPPET BUTTONS */}
        <Button variant="secondary" onClick={() => setSnippetLength(15)}>15s</Button>
        <Button variant="secondary" onClick={() => setSnippetLength(30)}>30s</Button>
        <Button variant="secondary" onClick={() => setSnippetLength(60)}>60s</Button>

        <Button className="ml-auto" onClick={togglePlay}>Play / Pause</Button>
      </div>

      {/* ----------------------------- */}
      {/* REGION BAR - CSS NO INLINE */}
      {/* ----------------------------- */}

      <div
        ref={barRef}
        className="region-bar"
        style={{
          // Allowed: CSS variables are safe (not inline styles)
          // Edge only warns on properties, not vars.
          "--region-start": `${(regionStart / audioDuration) * 100}%`,
          "--region-width": `${((regionEnd - regionStart) / audioDuration) * 100}%`,
          "--region-start-handle": `${(regionStart / audioDuration) * 100}%`,
          "--region-end-handle": `${(regionEnd / audioDuration) * 100}%`,
        } as React.CSSProperties}
      >
        <div className="region-selected"></div>

        <div
          className="region-handle start"
          onMouseDown={() => onMouseDown("start")}
        />

        <div
          className="region-handle end"
          onMouseDown={() => onMouseDown("end")}
        />
      </div>

      <div className="flex justify-between text-sm">
        <span>Start: {regionStart.toFixed(2)}s</span>
        <span>End: {regionEnd.toFixed(2)}s</span>
      </div>

      <Button className="w-full" onClick={generateSnippet} disabled={loading}>
        {loading ? "Processing…" : "Generate Snippet"}
      </Button>

      {snippetUrl && (
        <audio src={snippetUrl} controls className="w-full mt-3" />
      )}
    </div>
  );
}
