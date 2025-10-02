"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

interface UploadProps {
  onSuccess: () => void;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function SingleUploadForm({ onSuccess }: UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");

  // Metadata fields
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [explicit, setExplicit] = useState(false);
  const [tags, setTags] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  // Dropzones
  const { getRootProps: getAudioRoot, getInputProps: getAudioInput } = useDropzone({
    accept: { "audio/*": [] },
    multiple: false,
    onDrop: (files) => setFile(files[0]),
  });

  const { getRootProps: getCoverRoot, getInputProps: getCoverInput } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: (files) => {
      const cover = files[0];
      setCoverFile(cover);
      setCoverPreview(URL.createObjectURL(cover));
    },
  });

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!artist.trim()) newErrors.artist = "Artist is required.";
    if (!file) newErrors.file = "Audio file is required.";
    if (!coverFile) newErrors.cover = "Cover image is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = async () => {
    if (!validate()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("song", file!);
    formData.append("cover", coverFile!);
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("album", album);
    formData.append("genre", genre);
    formData.append("language", language);
    formData.append("releaseDate", releaseDate);
    formData.append("explicit", explicit.toString());
    formData.append("tags", tags);

    try {
      const res = await fetch(`/api/songs/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");

      toast.success("Single uploaded successfully!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Error uploading single");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="rounded-2xl border-none md:border md:border-neutral-800 bg-neutral-900/80 text-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            Upload Single
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Metadata */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-neutral-300">Song Title *</Label>
              <Input
                className="bg-neutral-800 border-neutral-700 text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Song title"
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
            </div>
            <div>
              <Label className="text-neutral-300">Artist *</Label>
              <Input
                className="bg-neutral-800 border-neutral-700 text-white"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist name"
              />
              {errors.artist && <p className="text-red-500 text-sm">{errors.artist}</p>}
            </div>
            <div>
              <Label className="text-neutral-300">Album</Label>
              <Input
                className="bg-neutral-800 border-neutral-700 text-white"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="Optional album name"
              />
            </div>
            <div>
              <Label className="text-neutral-300">Genre</Label>
              <Input
                className="bg-neutral-800 border-neutral-700 text-white"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Hip-Hop, Pop, Jazz..."
              />
            </div>
            <div>
              <Label className="text-neutral-300">Language</Label>
              <Input
                className="bg-neutral-800 border-neutral-700 text-white"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="English, Spanish..."
              />
            </div>
            <div>
              <Label className="text-neutral-300">Release Date</Label>
              <Input
                type="date"
                className="bg-neutral-800 border-neutral-700 text-white"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-neutral-300">Tags</Label>
              <Input
                className="bg-neutral-800 border-neutral-700 text-white"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="chill, summer, party"
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                aria-label="checkbox-button"
                type="checkbox"
                checked={explicit}
                onChange={(e) => setExplicit(e.target.checked)}
                className="accent-blue-600"
              />
              <Label className="text-neutral-300">Explicit Content</Label>
            </div>
          </div>

          {/* Cover Upload */}
          <div
            {...getCoverRoot()}
            className="border-2 border-dashed border-neutral-700 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500"
          >
            <input {...getCoverInput()} />
            {coverPreview ? (
              <img src={coverPreview} alt="Cover preview" className="mx-auto max-h-40 rounded-lg shadow-md" />
            ) : (
              <div className="flex flex-col items-center text-neutral-400">
                <UploadCloud className="w-8 h-8 mb-2" />
                <p>Upload cover image</p>
              </div>
            )}
            {errors.cover && <p className="text-red-500 text-sm">{errors.cover}</p>}
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
            {errors.file && <p className="text-red-500 text-sm">{errors.file}</p>}
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
          >
            {uploading && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
            {uploading ? "Uploading..." : "Upload Single"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
