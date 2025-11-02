"use client";

import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import {
  Music,
  ImageIcon,
  Upload,
  CheckCircle2,
  Loader2,
  Pause,
  Play,
  Calendar,
  PenLine,
  Globe,
  Users2,
  Building2,
  Copyright,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { getSocket } from "@/lib/socketClient";
import { Socket } from "socket.io-client";
import { cn } from "@/lib/utils";

interface AlbumUploadFormProps {
  onSuccess?: () => void;
}

interface SongMetadata {
  file: File;
  title: string;
  artist: string;
  genre: string;
  explicit: boolean;
  features: string;
  tags: string;
}

interface UploadProgress {
  [filename: string]: number;
}

export default function AlbumUploadForm({ onSuccess }: AlbumUploadFormProps) {
  const [step, setStep] = useState(1);
  const socket = getSocket() as Socket | null;

  // ── Album Metadata ──────────────────────────────────────────────
  const [albumTitle, setAlbumTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [producers, setProducers] = useState("");
  const [collaborators, setCollaborators] = useState("");
  const [mood, setMood] = useState("");
  const [label, setLabel] = useState("");
  const [copyright, setCopyright] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private" | "unlisted">("private");

  // ── Files ───────────────────────────────────────────────────────
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [songs, setSongs] = useState<SongMetadata[]>([]);

  // ── Upload State ────────────────────────────────────────────────
  const [uploading, setUploading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  // ── Socket Listeners for Real-Time Feedback ─────────────────────
  useEffect(() => {
    if (!socket) return;
    socket.on("uploadProgress", ({ fileName, progress }) =>
      setUploadProgress((p) => ({ ...p, [fileName]: progress }))
    );
    socket.on("uploadComplete", ({ fileName }) =>
      toast.success(`${fileName} uploaded successfully`)
    );
    return () => {
      socket.off("uploadProgress");
      socket.off("uploadComplete");
    };
  }, [socket]);

  // ── Upload Logic with XHR Progress Tracking ─────────────────────
  const handleUpload = async () => {
    if (!albumTitle || !artist || !cover || songs.length === 0) {
      toast.error("Please complete all required fields before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("title", albumTitle);
    formData.append("artist", artist);
    formData.append("genre", genre);
    formData.append("releaseDate", releaseDate);
    formData.append("description", description);
    formData.append("tags", tags);
    formData.append("producers", producers);
    formData.append("collaborators", collaborators);
    formData.append("mood", mood);
    formData.append("label", label);
    formData.append("copyright", copyright);
    formData.append("visibility", visibility);
    formData.append("cover", cover);

    songs.forEach((song, i) => {
      formData.append(`songs[${i}][file]`, song.file, song.file.name);
      formData.append(`songs[${i}][title]`, song.title);
      formData.append(`songs[${i}][artist]`, song.artist);
      formData.append(`songs[${i}][genre]`, song.genre);
      formData.append(`songs[${i}][explicit]`, String(song.explicit));
      formData.append(`songs[${i}][features]`, song.features);
      formData.append(`songs[${i}][tags]`, song.tags);
    });

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    setUploading(true);
    setPaused(false);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        setUploadProgress((p) => ({ ...p, total: progress }));
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status <= 300) {
        toast.success("Album uploaded successfully!");
        onSuccess?.();
        resetForm();
      } else toast.error("Upload failed.");
    };

    xhr.onerror = () => {
      setUploading(false);
      toast.error("Network error during upload.");
    };

    xhr.open("POST", "/api/albums/upload", true);
    xhr.send(formData);
  };

  const handlePauseResume = () => {
    if (!uploading) return;
    if (!paused) {
      xhrRef.current?.abort();
      setPaused(true);
      toast("Upload paused");
    } else {
      toast("Resuming upload...");
      setPaused(false);
      void handleUpload();
    }
  };

  const resetForm = () => {
    setStep(1);
    setAlbumTitle("");
    setArtist("");
    setGenre("");
    setReleaseDate("");
    setDescription("");
    setTags("");
    setProducers("");
    setCollaborators("");
    setMood("");
    setLabel("");
    setCopyright("");
    setVisibility("private");
    setCover(null);
    setCoverPreview(null);
    setSongs([]);
    setUploadProgress({});
    setUploading(false);
    setPaused(false);
  };

  // ── Dropzones ───────────────────────────────────────────────────
  const { getRootProps: getCoverRoot, getInputProps: getCoverInput } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: (accepted) => {
      const file = accepted[0];
      setCover(file);
      setCoverPreview(URL.createObjectURL(file));
    },
  });

  const { getRootProps: getSongsRoot, getInputProps: getSongsInput } = useDropzone({
    accept: { "audio/*": [] },
    multiple: true,
    onDrop: (accepted) => {
      const newSongs = accepted.map((f) => ({
        file: f,
        title: f.name.replace(/\.[^/.]+$/, ""),
        artist,
        genre: "",
        explicit: false,
        features: "",
        tags: "",
      }));
      setSongs((s) => [...s, ...newSongs]);
    },
  });

  // ── UI Helpers ─────────────────────────────────────────────────
  const renderProgress = (fileName: string) => {
    const progress = uploadProgress[fileName] ?? uploadProgress.total ?? 0;
    return (
      <div className="mt-2">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-neutral-400 mt-1">{progress.toFixed(1)}%</p>
      </div>
    );
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 6));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // ── Main UI ─────────────────────────────────────────────────────
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="border border-neutral-800 bg-neutral-950/80 rounded-2xl text-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Music className="w-6 h-6 text-blue-500" /> Upload New Album — <span className="text-blue-400">LoudEar</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ── Step Indicator ────────────────────────────────────── */}
          <div className="flex justify-center gap-3 mb-6">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  step >= s ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-400"
                )}
              >
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
            ))}
          </div>

          {/* Step 1: Album Info */}
          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Album Title *</Label>
                <Input value={albumTitle} onChange={(e) => setAlbumTitle(e.target.value)} />
              </div>
              <div>
                <Label>Artist *</Label>
                <Input value={artist} onChange={(e) => setArtist(e.target.value)} />
              </div>
              <div>
                <Label>Genre</Label>
                <Input value={genre} onChange={(e) => setGenre(e.target.value)} />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Release Date
                </Label>
                <Input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="col-span-2 flex justify-end pt-4">
                <Button onClick={nextStep}>Next</Button>
              </div>
            </div>
          )}

          {/* Step 2: Cover Upload */}
          {step === 2 && (
            <div className="space-y-4">
              <Label>Album Cover *</Label>
              <div {...getCoverRoot()} className="border-2 border-dashed border-neutral-700 rounded-xl p-6 text-center cursor-pointer">
                <input {...getCoverInput()} />
                {coverPreview ? (
                  <Image src={coverPreview} alt="Cover" width={200} height={200} className="rounded-xl mx-auto" />
                ) : (
                  <div className="text-neutral-400">
                    <ImageIcon className="w-10 h-10 mb-2 mx-auto" />
                    Drop or select album cover
                  </div>
                )}
              </div>
              <div className="flex justify-between pt-4">
                <Button onClick={prevStep}>Back</Button>
                <Button onClick={nextStep}>Next</Button>
              </div>
            </div>
          )}

          {/* Step 3: Upload Songs */}
          {step === 3 && (
            <div className="space-y-4">
              <Label>Songs *</Label>
              <div {...getSongsRoot()} className="border-2 border-dashed border-neutral-700 rounded-xl p-6 text-center cursor-pointer">
                <input {...getSongsInput()} />
                <div className="text-neutral-400">
                  <Upload className="w-10 h-10 mb-2 mx-auto" />
                  Drop or select song files
                </div>
              </div>
              {songs.map((s, i) => (
                <div key={i} className="flex justify-between items-center border border-neutral-700 rounded-lg px-3 py-2">
                  <span>{s.title}</span>
                  <Button variant="ghost" size="sm" onClick={() => setStep(4)} className="text-blue-400 hover:text-blue-600">
                    <PenLine className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex justify-between pt-4">
                <Button onClick={prevStep}>Back</Button>
                <Button onClick={nextStep}>Next</Button>
              </div>
            </div>
          )}

          {/* Step 4: Song Metadata */}
          {step === 4 && (
            <div className="space-y-4">
              {songs.map((song, i) => (
                <Card key={i} className="border border-neutral-800 bg-neutral-950/50 p-4">
                  <Label className="text-sm text-neutral-400">Track {i + 1}</Label>
                  <Input placeholder="Title" value={song.title} onChange={(e) => {
                    const s = [...songs]; s[i].title = e.target.value; setSongs(s);
                  }} />
                  <Input placeholder="Features" className="mt-2" value={song.features} onChange={(e) => {
                    const s = [...songs]; s[i].features = e.target.value; setSongs(s);
                  }} />
                  <Input placeholder="Genre" className="mt-2" value={song.genre} onChange={(e) => {
                    const s = [...songs]; s[i].genre = e.target.value; setSongs(s);
                  }} />
                  <div className="flex items-center gap-2 mt-2">
                    <Switch checked={song.explicit} onCheckedChange={(v) => {
                      const s = [...songs]; s[i].explicit = v; setSongs(s);
                    }} />
                    <Label>Explicit Content</Label>
                  </div>
                </Card>
              ))}
              <div className="flex justify-between pt-4">
                <Button onClick={prevStep}>Back</Button>
                <Button onClick={nextStep}>Next</Button>
              </div>
            </div>
          )}

          {/* Step 5: Extra Album Details */}
          {step === 5 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2"><Users2 className="w-4 h-4" /> Producers</Label>
                <Input value={producers} onChange={(e) => setProducers(e.target.value)} placeholder="Comma separated" />
              </div>
              <div>
                <Label className="flex items-center gap-2"><Users2 className="w-4 h-4" /> Collaborators</Label>
                <Input value={collaborators} onChange={(e) => setCollaborators(e.target.value)} placeholder="Comma separated" />
              </div>
              <div>
                <Label><Globe className="w-4 h-4" /> Mood</Label>
                <Input value={mood} onChange={(e) => setMood(e.target.value)} />
              </div>
              <div>
                <Label><Building2 className="w-4 h-4" /> Label</Label>
                <Input value={label} onChange={(e) => setLabel(e.target.value)} />
              </div>
              <div>
                <Label><Copyright className="w-4 h-4" /> Copyright</Label>
                <Input value={copyright} onChange={(e) => setCopyright(e.target.value)} />
              </div>
              <div>
                <Label>Visibility</Label>
                <select
                  aria-label="visibility-select"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="bg-neutral-800 rounded-lg p-2 w-full"
                >
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="public">Public</option>
                </select>
              </div>
              <div className="col-span-2 flex justify-between pt-4">
                <Button onClick={prevStep}>Back</Button>
                <Button onClick={nextStep}>Next</Button>
              </div>
            </div>
          )}

          {/* Step 6: Upload */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pt-4">
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {uploading ? "Uploading..." : "Upload Album"}
                </Button>
                {uploading && (
                  <Button onClick={handlePauseResume} variant="outline" className="flex items-center gap-2">
                    {paused ? <><Play className="w-4 h-4" /> Resume</> : <><Pause className="w-4 h-4" /> Pause</>}
                  </Button>
                )}
              </div>

              <div className="mt-6 space-y-3">
                {cover && (
                  <div>
                    <p className="text-sm text-neutral-300">Cover</p>
                    {renderProgress(cover.name)}
                  </div>
                )}
                {songs.map((song) => (
                  <div key={song.file.name}>
                    <p className="text-sm text-neutral-300">{song.title}</p>
                    {renderProgress(song.file.name)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
