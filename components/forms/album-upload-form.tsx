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
import {
  Upload,
  Music,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Tag,
  Calendar,
  Info,
  X,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";

interface AlbumUploadFormProps {
  onSuccess?: () => void;
}

interface SongMetadata {
  file: File;
  title: string;
  artist: string;
  features: string;
  genre: string;
  explicit: boolean;
  tags: string;
}

//const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function AlbumUploadForm({ onSuccess }: AlbumUploadFormProps) {
  const [step, setStep] = useState(1);

  // Album fields
  const [albumTitle, setAlbumTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [features, setFeatures] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  // Files
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [songs, setSongs] = useState<SongMetadata[]>([]);

  // States
  const [uploading, setUploading] = useState(false);

  // Dropzones
  const { getRootProps: getCoverRoot, getInputProps: getCoverInput } =
    useDropzone({
      accept: { "image/*": [] },
      multiple: false,
      onDrop: (acceptedFiles) => {
        const file = acceptedFiles[0];
        setCover(file);
        setCoverPreview(URL.createObjectURL(file));
      },
    });

  const { getRootProps: getSongsRoot, getInputProps: getSongsInput } =
    useDropzone({
      accept: { "audio/*": [] },
      multiple: true,
      onDrop: (acceptedFiles) => {
        const newSongs = acceptedFiles.map((file) => ({
          file,
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist,
          features: "",
          genre: "",
          explicit: false,
          tags: "",
        }));
        setSongs((prev) => [...prev, ...newSongs]);
      },
    });

  // Upload handler
  const handleUpload = async () => {
    if (!albumTitle || !artist || !cover || songs.length === 0) {
      toast.error("Please complete all required fields before uploading.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("albumTitle", albumTitle);
    formData.append("artist", artist);
    formData.append("genre", genre);
    formData.append("releaseDate", releaseDate);
    formData.append("description", description);
    formData.append("tags", tags);
    formData.append("cover", cover);

    songs.forEach((song, idx) => {
      formData.append(`songs[${idx}][file]`, song.file);
      formData.append(`songs[${idx}][title]`, song.title);
      formData.append(`songs[${idx}][artist]`, song.artist);
      formData.append(`songs[${idx}][features]`, song.features);
      formData.append(`songs[${idx}][genre]`, genre);
      formData.append(`songs[${idx}][description]`, description);
      formData.append(`songs[${idx}][explicit]`, String(song.explicit));
      formData.append(`songs[${idx}][tags]`, tags);
    });

    try {
      const res = await fetch(`/api/albums/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Album uploaded successfully!");
      if (onSuccess) onSuccess();
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Error uploading album");
    } finally {
      setUploading(false);
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
    setCover(null);
    setCoverPreview(null);
    setSongs([]);
  };

  // Step content
  const renderStep = () => {
    switch (step) {
      case 1: // Album info
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-neutral-300">Album Title *</Label>
              <Input
                className="bg-neutral-800 border-neutral-700 text-white capitalize"
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-neutral-300">Artist *</Label>
              <Input
                className="bg-neutral-800 border-neutral-700 text-white"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-neutral-300">Genre</Label>
              <Input
                className="bg-neutral-800 border-neutral-700 text-white"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </div>
            <div>
              <Label className="flex items-center gap-2 text-neutral-300">
                <Calendar className="w-4 h-4" /> Release Date
              </Label>
              <Input
                type="date"
                className="bg-neutral-800 border-neutral-700 text-white"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label className="flex items-center gap-2 text-neutral-300">
                <Info className="w-4 h-4" /> Description
              </Label>
              <Textarea
                className="bg-neutral-800 border-neutral-700 text-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label className="flex items-center gap-2 text-neutral-300">
                <Tag className="w-4 h-4" /> Tags
              </Label>
              <Input
                className="bg-neutral-800 border-neutral-700 text-white"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>
        );

      case 2: // Album cover
        return (
          <div>
            <Label className="text-neutral-300">Album Cover *</Label>
            <div
              {...getCoverRoot()}
              className="border-2 border-dashed border-neutral-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500"
            >
              <input {...getCoverInput()} />
              {coverPreview ? (
                <Image
                  src={coverPreview}
                  width={30}
                  height={30}
                  alt="Album cover"
                  className="w-40 h-40 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="flex flex-col items-center text-neutral-400">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <p>Drag & drop or click to upload cover</p>
                </div>
              )}
            </div>
          </div>
        );

      case 3: // Songs
        return (
          <div className="space-y-6">
            <div
              {...getSongsRoot()}
              className="border-2 border-dashed border-neutral-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-green-500"
            >
              <input {...getSongsInput()} />
              <Upload className="w-12 h-12 text-neutral-400 mb-2" />
              <p className="text-neutral-400">
                Drag & drop or click to select songs
              </p>
            </div>

            {songs.map((song, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-neutral-700 rounded-xl p-4 bg-neutral-800 relative"
              >
                <button
                  aria-label="button"
                  type="button"
                  onClick={() =>
                    setSongs((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="absolute top-2 right-2 text-neutral-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
                <h4 className="capitalize font-medium text-neutral-200 mb-3">
                  {song.file.name}
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-neutral-300">Title</Label>
                    <Input
                      className="bg-neutral-800 border-neutral-700 text-white capitalize"
                      value={song.title}
                      onChange={(e) =>
                        setSongs((prev) => {
                          const copy = [...prev];
                          copy[idx].title = e.target.value;
                          return copy;
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-neutral-300">Artist</Label>
                    <Input
                      className="bg-neutral-800 border-neutral-700 text-white"
                      value={song.artist}
                      onChange={(e) =>
                        setSongs((prev) => {
                          const copy = [...prev];
                          copy[idx].artist = e.target.value;
                          return copy;
                        })
                      }
                    />
                  </div>
                   <div>
                      <Label className="text-neutral-300">Feature (Optional)</Label>
                      <Input
                        className="bg-neutral-800 border-neutral-700 text-white"
                        value={features}
                        onChange={(e) => setFeatures(e.target.value)}
                        placeholder="Feature names eg. John, Dave"
                      />
                    </div>
                  <div>
                    <Label className="text-neutral-300">Genre</Label>
                    <Input
                      className="bg-neutral-800 border-neutral-700 text-white"
                      value={song.genre}
                      onChange={(e) =>
                        setSongs((prev) => {
                          const copy = [...prev];
                          copy[idx].genre = e.target.value;
                          return copy;
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <input
                      aria-label="checkbox"
                      type="checkbox"
                      checked={song.explicit}
                      onChange={(e) =>
                        setSongs((prev) => {
                          const copy = [...prev];
                          copy[idx].explicit = e.target.checked;
                          return copy;
                        })
                      }
                      className="accent-blue-600"
                    />
                    <Label className="text-neutral-300">Explicit</Label>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-neutral-300">Tags</Label>
                    <Input
                      className="bg-neutral-800 border-neutral-700 text-white"
                      value={song.tags}
                      onChange={(e) =>
                        setSongs((prev) => {
                          const copy = [...prev];
                          copy[idx].tags = e.target.value;
                          return copy;
                        })
                      }
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 4: // Review
        return (
          <div className="space-y-6 text-neutral-200">
            <h3 className="font-semibold text-lg">Review Album</h3>
            <p>
              <span className="font-medium">Title:</span> {albumTitle}
            </p>
            <p>
              <span className="font-medium">Artist:</span> {artist}
            </p>
            {genre && (
              <p>
                <span className="font-medium">Genre:</span> {genre}
              </p>
            )}
            {releaseDate && (
              <p>
                <span className="font-medium">Release Date:</span>{" "}
                {releaseDate}
              </p>
            )}
            {tags && (
              <p>
                <span className="font-medium">Tags:</span> {tags}
              </p>
            )}
            {description && (
              <p className="text-neutral-400">{description}</p>
            )}
            {coverPreview && (
              <Image
                src={coverPreview}
                width={30}
                height={30}
                alt="Album Cover"
                className="w-40 h-40 rounded-lg shadow-md object-cover"
              />
            )}
            <div>
              <h4 className="font-semibold mt-4 mb-2">Tracks:</h4>
              {songs.map((song, idx) => (
                <p key={idx} className="text-sm text-neutral-400">
                  {song.title} — {song.artist || artist}
                </p>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="rounded-2xl border-none md:border md:border-neutral-800 bg-neutral-900/80 text-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2 text-white">
            <Music className="w-6 h-6 text-blue-500" />
            Upload New Album
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stepper */}
          <div className="flex items-center justify-between text-sm">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 flex flex-col items-center ${
                  step === s
                    ? "font-bold text-blue-500"
                    : step > s
                    ? "text-green-500"
                    : "text-neutral-600"
                }`}
              >
                {step > s ? (
                  <CheckCircle2 className="w-5 h-5 mb-1" />
                ) : (
                  <span className="w-5 h-5 rounded-full border border-neutral-600 flex items-center justify-center mb-1">
                    {s}
                  </span>
                )}
                Step {s}
              </div>
            ))}
          </div>

          {/* Step content */}
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="bg-black flex items-center gap-1 border-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            )}
            {step < 4 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                className="ml-auto flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                {uploading ? "Uploading..." : "Upload Album"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
