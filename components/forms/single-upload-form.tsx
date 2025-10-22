"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Info, Loader2, UploadCloud, Clock } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UploadProps {
  onSuccess: () => void;
}

export default function SingleUploadForm({ onSuccess }: UploadProps) {
  // Files
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");

  // Duration (seconds)
  const [duration, setDuration] = useState<number | null>(null);

  // Metadata
  const [form, setForm] = useState({
    title: "",
    artist: "",
    features: [] as string[],
    genre: "",
    description: "",
    tags: [] as string[],
    album: "",
    explicit: false,
    bpm: "",
    key: "",
    mood: "",
    label: "",
    visibility: "private" as "public" | "private" | "unlisted",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  // Dropzones
  const { getRootProps: getAudioRoot, getInputProps: getAudioInput } =
    useDropzone({
      accept: { "audio/*": [] },
      multiple: false,
      onDrop: (files) => {
        const audioFile = files[0];
        setFile(audioFile);
        extractAudioDuration(audioFile);
      },
    });

  const { getRootProps: getCoverRoot, getInputProps: getCoverInput } =
    useDropzone({
      accept: { "image/*": [] },
      multiple: false,
      onDrop: (files) => {
        const cover = files[0];
        setCoverFile(cover);
        setCoverPreview(URL.createObjectURL(cover));
      },
    });

  // ✅ Extract duration from uploaded audio file
  const extractAudioDuration = (audioFile: File) => {
    try {
      const audio = document.createElement("audio");
      audio.preload = "metadata";
      audio.src = URL.createObjectURL(audioFile);

      audio.onloadedmetadata = () => {
        window.URL.revokeObjectURL(audio.src);
        const secs = audio.duration;
        setDuration(secs);
        console.log("Audio Duration:", secs, "seconds");
      };
    } catch (error) {
      console.error("Error getting audio duration:", error);
      toast.error("Unable to read audio duration.");
    }
  };

  // ✅ Format seconds → mm:ss for display
  const formatDuration = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  // ✅ Handle form state updates
  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ✅ Handle comma-separated arrays (features, tags)
  const handleArrayInput = (key: "features" | "tags", value: string) => {
    handleChange(
      key,
      value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    );
  };

  // ✅ Validate form
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Title is required.";
    if (!form.artist.trim()) newErrors.artist = "Artist is required.";
    if (!file) newErrors.file = "Audio file is required.";
    if (!coverFile) newErrors.cover = "Cover image is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit upload
  const handleUpload = async () => {
    if (!validate()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("song", file!);
    formData.append("cover", coverFile!);
    if (duration) formData.append("duration", duration.toString());

    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value)) formData.append(key, JSON.stringify(value));
      else formData.append(key, String(value ?? ""));
    });

    try {
      const res = await fetch(`/api/songs/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      toast.success("Song uploaded successfully!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Error uploading song");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="rounded-2xl border border-neutral-800 bg-neutral-900/80 text-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            Upload New Song
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Metadata Section */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="bg-neutral-800 border-neutral-700"
                placeholder="Song title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title}</p>
              )}
            </div>

            <div>
              <Label>Artist *</Label>
              <Input
                value={form.artist}
                onChange={(e) => handleChange("artist", e.target.value)}
                className="bg-neutral-800 border-neutral-700"
                placeholder="Artist name"
              />
              {errors.artist && (
                <p className="text-red-500 text-sm">{errors.artist}</p>
              )}
            </div>

            <div>
              <Label>Features</Label>
              <Input
                value={form.features.join(", ")}
                onChange={(e) => handleArrayInput("features", e.target.value)}
                className="bg-neutral-800 border-neutral-700"
                placeholder="Comma-separated list"
              />
            </div>

            <div>
              <Label>Album</Label>
              <Input
                value={form.album}
                onChange={(e) => handleChange("album", e.target.value)}
                className="bg-neutral-800 border-neutral-700"
                placeholder="Optional album name or ID"
              />
            </div>

            <div>
              <Label>Genre</Label>
              <Input
                value={form.genre}
                onChange={(e) => handleChange("genre", e.target.value)}
                className="bg-neutral-800 border-neutral-700"
                placeholder="Hip-Hop, Pop, Jazz..."
              />
            </div>

            <div>
              <Label>Label</Label>
              <Input
                value={form.label}
                onChange={(e) => handleChange("label", e.target.value)}
                className="bg-neutral-800 border-neutral-700"
                placeholder="Label name"
              />
            </div>

            <div>
              <Label>BPM</Label>
              <Input
                type="number"
                value={form.bpm}
                onChange={(e) => handleChange("bpm", e.target.value)}
                className="bg-neutral-800 border-neutral-700"
                placeholder="e.g. 120"
              />
            </div>

            <div>
              <Label>Key</Label>
              <Input
                value={form.key}
                onChange={(e) => handleChange("key", e.target.value)}
                className="bg-neutral-800 border-neutral-700"
                placeholder="e.g. C Major"
              />
            </div>

            <div>
              <Label>Mood</Label>
              <Input
                value={form.mood}
                onChange={(e) => handleChange("mood", e.target.value)}
                className="bg-neutral-800 border-neutral-700"
                placeholder="Happy, Sad, Energetic..."
              />
            </div>

            <div>
              <Label>Tags</Label>
              <Input
                value={form.tags.join(", ")}
                onChange={(e) => handleArrayInput("tags", e.target.value)}
                className="bg-neutral-800 border-neutral-700"
                placeholder="Comma-separated"
              />
            </div>

            {duration && (
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <Clock className="w-4 h-4" />
                <span>Duration: {formatDuration(duration)}</span>
              </div>
            )}

            <div className="col-span-2">
              <Label className="flex items-center gap-2 text-neutral-300">
                <Info className="w-4 h-4" /> Description
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="bg-neutral-800 border-neutral-700"
                placeholder="Describe your track..."
              />
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input
                aria-label="checkbox-input"
                type="checkbox"
                checked={form.explicit}
                onChange={(e) => handleChange("explicit", e.target.checked)}
                className="accent-blue-600"
              />
              <Label>Explicit Content</Label>
            </div>

            <div>
              <Label>Visibility</Label>
              <Select
                value={form.visibility}
                onValueChange={(value) => handleChange("visibility", value)}
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-700">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cover Upload */}
          <div
            {...getCoverRoot()}
            className="border-2 border-dashed border-neutral-700 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500"
          >
            <input {...getCoverInput()} />
            {coverPreview ? (
              <Image
                src={coverPreview}
                width={120}
                height={120}
                alt="Cover preview"
                className="mx-auto rounded-lg shadow-md"
              />
            ) : (
              <div className="flex flex-col items-center text-neutral-400">
                <UploadCloud className="w-8 h-8 mb-2" />
                <p>Upload cover image</p>
              </div>
            )}
            {errors.cover && (
              <p className="text-red-500 text-sm">{errors.cover}</p>
            )}
          </div>

          {/* Audio Upload */}
          <div
            {...getAudioRoot()}
            className="border-2 border-dashed border-neutral-700 rounded-xl p-6 text-center cursor-pointer hover:border-green-500"
          >
            <input {...getAudioInput()} />
            {file ? (
              <p className="font-medium text-green-400">{file.name}</p>
            ) : (
              <div className="flex flex-col items-center text-neutral-400">
                <UploadCloud className="w-8 h-8 mb-2" />
                <p>Upload audio file</p>
              </div>
            )}
            {errors.file && (
              <p className="text-red-500 text-sm">{errors.file}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className={cn(
              "w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white",
              uploading && "opacity-70 cursor-not-allowed"
            )}
          >
            {uploading && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
            {uploading ? "Uploading..." : "Upload Song"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
