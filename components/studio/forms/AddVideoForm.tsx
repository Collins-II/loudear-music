"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { uploadToCloudinary } from "@/lib/helpers";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useDropzone } from "react-dropzone";

export default function AddVideoForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "",
    artist: "",
    videographer: "",
    mood: "",
    copyrightOwner: "",
    releaseDate: "",
    description: "",
    thumbnailUrl: "",
    videoUrl: "",
  });

  // DROPZONE FILE STATES
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const update = (key: string, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  const { getRootProps: getVideoRoot, getInputProps: getVideoInput } = useDropzone({
    accept: { "video/*": [] },
    multiple: false,
    onDrop: (files) => setVideoFile(files[0]),
  });

  const { getRootProps: getThumbRoot, getInputProps: getThumbInput } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: (files) => {
      if (files[0]) {
        setThumbnail(files[0]);
        setThumbnailPreview(URL.createObjectURL(files[0]));
      }
    },
  });

  useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [thumbnailPreview]);

  const uploadFile = async (file: File, folder: string, type: "image" | "video") => {
    const uploaded = await uploadToCloudinary(file, folder, type);
    return uploaded.secure_url;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      let thumbnailUrl = form.thumbnailUrl;
      let videoUrl = form.videoUrl;

      if (thumbnail) {
        thumbnailUrl = await uploadFile(thumbnail, "videos/thumbnails", "image");
      }

      if (videoFile) {
        videoUrl = await uploadFile(videoFile, "videos/raw", "video");
      }

      const payload = {
        ...form,
        mood: form.mood.split(",").map((m) => m.trim()),
        thumbnailUrl,
        videoUrl,
      };

      const res = await fetch("/api/videos/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save video");

      onSuccess?.();
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Failed to save video.");
    }

    setLoading(false);
  };

  return (
    <SheetContent>
      <ScrollArea className="h-screen">
        <SheetHeader>
          <SheetTitle>Add Video</SheetTitle>
          <SheetDescription asChild>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* TITLE */}
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="Video Title"
                  required
                />
              </div>

              {/* CATEGORY */}
              <div className="grid gap-2">
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  placeholder="Music Video / Promo / Short Clip..."
                  required
                />
              </div>

              {/* ARTIST */}
              <div className="grid gap-2">
                <Label>Artist</Label>
                <Input
                  value={form.artist}
                  onChange={(e) => update("artist", e.target.value)}
                  placeholder="Artist Name"
                />
              </div>

              {/* VIDEOGRAPHER */}
              <div className="grid gap-2">
                <Label>Videographer</Label>
                <Input
                  value={form.videographer}
                  onChange={(e) => update("videographer", e.target.value)}
                  placeholder="Videographer Name"
                />
              </div>

              {/* MOOD */}
              <div className="grid gap-2">
                <Label>Mood Tags (comma separated)</Label>
                <Input
                  value={form.mood}
                  onChange={(e) => update("mood", e.target.value)}
                  placeholder="dark, cinematic, energetic..."
                />
              </div>

              {/* COPYRIGHT */}
              <div className="grid gap-2">
                <Label>Copyright Owner</Label>
                <Input
                  value={form.copyrightOwner}
                  onChange={(e) => update("copyrightOwner", e.target.value)}
                  placeholder="Owner / Label"
                />
              </div>

              {/* RELEASE DATE */}
              <div className="grid gap-2">
                <Label>Release Date</Label>
                <Input
                  type="date"
                  value={form.releaseDate}
                  onChange={(e) => update("releaseDate", e.target.value)}
                />
              </div>

              {/* DESCRIPTION */}
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Describe the video..."
                  rows={4}
                />
              </div>

              {/* THUMBNAIL DROPZONE */}
              <div className="flex flex-col gap-2">
                <Label>Thumbnail *</Label>

                <div
                  {...getThumbRoot()}
                  className="w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-blue-500"
                >
                  <input {...getThumbInput()} />

                  {thumbnailPreview ? (
                    <Image
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      width={200}
                      height={120}
                      className="mx-auto rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-neutral-400">
                      <ImageIcon className="w-10 h-10 mb-2" />
                      <p>Click or drag a thumbnail image</p>
                    </div>
                  )}
                </div>
              </div>

              {/* VIDEO DROPZONE */}
              <div className="flex flex-col gap-2">
                <Label>Video *</Label>

                <div
                  {...getVideoRoot()}
                  className="w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-green-500"
                >
                  <input {...getVideoInput()} />

                  {videoFile ? (
                    <p className="text-neutral-300">{videoFile.name}</p>
                  ) : (
                    <div className="flex flex-col items-center text-neutral-400">
                      <Upload className="w-10 h-10 mb-2" />
                      <p>Click or drag a video file</p>
                    </div>
                  )}
                </div>
              </div>

              {/* SUBMIT */}
              <Button disabled={loading} className="w-full">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" /> Saving...
                  </span>
                ) : (
                  "Save Video"
                )}
              </Button>
            </form>
          </SheetDescription>
        </SheetHeader>
      </ScrollArea>
    </SheetContent>
  );
}
