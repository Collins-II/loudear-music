"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import Image from "next/image";
import { toast } from "sonner";
import {
  Music,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Upload,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

export default function AlbumUploadForm({ onSuccess }: AlbumUploadFormProps) {
  const [step, setStep] = useState<number>(1);
  const [uploading, setUploading] = useState<boolean>(false);

  // Album data
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
  const [visibility, setVisibility] =
    useState<"public" | "private" | "unlisted">("private");

  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [songs, setSongs] = useState<SongMetadata[]>([]);

  // Cover Dropzone
  const { getRootProps: getCoverRoot, getInputProps: getCoverInput } =
    useDropzone({
      accept: { "image/*": [] },
      multiple: false,
      onDrop: (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
          setCover(file);
          setCoverPreview(URL.createObjectURL(file));
        }
      },
    });

  // Song Dropzone
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

  // Upload Handler
  const handleUpload = async () => {
    if (!albumTitle || !artist || !cover || songs.length === 0) {
      toast.error("Please complete all required fields before uploading.");
      return;
    }

    setUploading(true);
    const formData = new FormData();

    formData.append("title", albumTitle);
    formData.append("artist", artist);
    formData.append("genre", genre);
    formData.append("releaseDate", releaseDate);
    formData.append("description", description);
    formData.append("visibility", visibility);
    formData.append("mood", mood);
    formData.append("label", label);
    formData.append("copyright", copyright);

    formData.append("cover", cover);
    formData.append(
      "tags",
      JSON.stringify(tags.split(",").map((t) => t.trim()).filter(Boolean))
    );
    formData.append(
      "producers",
      JSON.stringify(producers.split(",").map((t) => t.trim()).filter(Boolean))
    );
    formData.append(
      "collaborators",
      JSON.stringify(
        collaborators.split(",").map((t) => t.trim()).filter(Boolean)
      )
    );

    songs.forEach((song, idx) => {
      formData.append(`songs[${idx}][file]`, song.file);
      formData.append(`songs[${idx}][title]`, song.title);
      formData.append(`songs[${idx}][artist]`, song.artist);
    });

    try {
      const res = await fetch(`/api/albums/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      toast.success("Album uploaded successfully! 🎵");
      onSuccess?.();
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
    setProducers("");
    setCollaborators("");
    setMood("");
    setLabel("");
    setCopyright("");
    setVisibility("private");
    setCover(null);
    setCoverPreview(null);
    setSongs([]);
  };

  // Summary Preview
  const renderSummary = () => (
    <div className="space-y-6">
      <div className="flex gap-6">
        {coverPreview && (
          <Image
            src={coverPreview}
            alt="Cover Preview"
            width={150}
            height={150}
            className="rounded-lg shadow-md"
          />
        )}
        <div className="space-y-2 text-sm">
          <p><strong>Album Title:</strong> {albumTitle}</p>
          <p><strong>Artist:</strong> {artist}</p>
          <p><strong>Genre:</strong> {genre || "—"}</p>
          <p><strong>Release Date:</strong> {releaseDate || "—"}</p>
          <p><strong>Label:</strong> {label || "—"}</p>
          <p><strong>Copyright:</strong> {copyright || "—"}</p>
          <p><strong>Visibility:</strong> {visibility}</p>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold mt-4 mb-2">
          Songs ({songs.length})
        </h4>
        <ul className="space-y-2">
          {songs.map((s, i) => (
            <li
              key={i}
              className="text-neutral-300 bg-neutral-800 p-2 rounded-md text-sm"
            >
              🎵 {s.title}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-lg font-semibold mt-4 mb-2">Additional Info</h4>
        <p><strong>Tags:</strong> {tags || "—"}</p>
        <p><strong>Producers:</strong> {producers || "—"}</p>
        <p><strong>Collaborators:</strong> {collaborators || "—"}</p>
        <p><strong>Mood:</strong> {mood || "—"}</p>
        <p><strong>Description:</strong> {description || "—"}</p>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label>Album Title *</Label>
              <Input
                className="bg-neutral-800 border-neutral-700 text-white"
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
              />
            </div>
            <div>
              <Label>Artist *</Label>
              <Input
                className="bg-neutral-800 border-neutral-700 text-white"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              />
            </div>
            <div>
              <Label>Genre</Label>
              <Input
                className="bg-neutral-800 border-neutral-700 text-white"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </div>
            <div>
              <Label>Release Date</Label>
              <Input
                type="date"
                className="bg-neutral-800 border-neutral-700 text-white"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                className="bg-neutral-800 border-neutral-700 text-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label>Tags</Label>
              <Input
                className="bg-neutral-800 border-neutral-700 text-white"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <div>
              <Label>Producers</Label>
              <Input
                className="bg-neutral-800 border-neutral-700 text-white"
                value={producers}
                onChange={(e) => setProducers(e.target.value)}
              />
            </div>
            <div>
              <Label>Label</Label>
              <Input
                className="bg-neutral-800 border-neutral-700 text-white"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            <div>
              <Label>Copyright</Label>
              <Input
                className="bg-neutral-800 border-neutral-700 text-white"
                value={copyright}
                onChange={(e) => setCopyright(e.target.value)}
              />
            </div>
            <div>
              <Label>Mood</Label>
              <Input
                className="bg-neutral-800 border-neutral-700 text-white"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
              />
            </div>
            <div>
              <Label>Collaborators</Label>
              <Input
                className="bg-neutral-800 border-neutral-700 text-white"
                value={collaborators}
                onChange={(e) => setCollaborators(e.target.value)}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <Label>Album Cover *</Label>
            <div
              {...getCoverRoot()}
              className="border-2 border-dashed border-neutral-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500"
            >
              <input {...getCoverInput()} />
              {coverPreview ? (
                <Image
                  src={coverPreview}
                  width={160}
                  height={160}
                  alt="Album cover"
                  className="rounded-lg shadow-md"
                />
              ) : (
                <div className="flex flex-col items-center text-neutral-400">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <p>Drag & drop or click to upload</p>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div
              {...getSongsRoot()}
              className="border-2 border-dashed border-neutral-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-green-500"
            >
              <input {...getSongsInput()} />
              <Upload className="w-12 h-12 text-neutral-400 mb-2" />
              <p className="text-neutral-400">Drag & drop or click to add songs</p>
            </div>
            {songs.map((song, idx) => (
              <motion.div
                key={idx}
                className="border border-neutral-700 rounded-xl p-4 bg-neutral-800 relative"
              >
                <button
                  aria-label="close-button"
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
              </motion.div>
            ))}
          </div>
        );

      case 5:
        return renderSummary();

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
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Music className="w-6 h-6 text-blue-500" />
            Upload New Album
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Stepper */}
          <div className="flex items-center justify-between text-sm">
            {[1, 2, 3, 4, 5].map((s) => (
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
            {step < 5 ? (
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
                {uploading ? "Uploading..." : "Confirm & Upload"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
