"use client";

import { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  Video,
  ImageIcon,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { uploadToCloudinary } from "@/lib/helpers";
import { Progress } from "../ui/progress";

interface VideoUploadFormProps {
  onSuccess?: () => void;
}

export default function VideoUploadForm({ onSuccess }: VideoUploadFormProps) {
  const [step, setStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Metadata fields
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [videographer, setVideographer] = useState("");
  const [genre, setGenre] = useState("");
  const [features, setFeatures] = useState("");
  const [description, setDescription] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [tags, setTags] = useState("");
  const [label, setLabel] = useState("");
  const [mood, setMood] = useState("");
  const [copyright, setCopyright] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private" | "unlisted">("private");

  // Files
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);

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

  // ---- Upload Handler ----
  const handleUpload = async () => {
    if (!title || !artist || !videographer || !videoFile || !thumbnail) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let thumbResult: string | undefined;
      let videoUrl: string | undefined;

      // Thumbnail upload
      if (thumbnail) {
        const thumbUpload = await uploadToCloudinary(
          thumbnail,
          "videos/thumbnails",
          "image",
          (p) => setUploadProgress(p)
        );
        thumbResult = thumbUpload.secure_url;
      }

      // Video upload
      if (videoFile) {
        const videoUpload = await uploadToCloudinary(
          videoFile,
          "videos/files",
          "video",
          (p) => setUploadProgress(p)
        );
        videoUrl = videoUpload.secure_url;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("artist", artist);
      formData.append("videographer", videographer);
      formData.append("genre", genre);
      formData.append("description", description);
      formData.append("features", features);
      formData.append("releaseDate", releaseDate);
      formData.append("tags", tags);
      formData.append("label", label);
      formData.append("mood", mood);
      formData.append("copyright", copyright);
      formData.append("visibility", visibility);
      formData.append("video", videoUrl as string);
      formData.append("thumbnail", thumbResult as string);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/videos/upload");
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        setUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          toast.success("Video uploaded successfully!");
          onSuccess?.();
          resetForm();
        } else {
          toast.error("Upload failed: " + xhr.statusText);
        }
      };

      xhr.onerror = () => {
        toast.error("Upload failed. Network error.");
        setUploading(false);
      };

      xhr.send(formData);
    } catch (err: any) {
      toast.error(err.message || "Upload error");
      setUploading(false);
    }
  };

  const handleCancelUpload = () => {
    controllerRef.current?.abort();
    setUploading(false);
    setUploadProgress(0);
    toast.info("Upload canceled.");
  };

  const resetForm = () => {
    setStep(1);
    setTitle("");
    setArtist("");
    setVideographer("");
    setGenre("");
    setReleaseDate("");
    setDescription("");
    setTags("");
    setLabel("");
    setMood("");
    setCopyright("");
    setVisibility("private");
    setVideoFile(null);
    setThumbnail(null);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailPreview(null);
  };

  // ---- Step Renderer ----
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title" />
            </div>
            <div>
              <Label>Artist *</Label>
              <Input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Enter artist" />
            </div>
            <div>
              <Label>Videographer *</Label>
              <Input value={videographer} onChange={(e) => setVideographer(e.target.value)} placeholder="Enter videographer" />
            </div>
            <div>
              <Label>Genre</Label>
              <Input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="e.g. Hip-hop, Gospel" />
            </div>
            <div>
              <Label>Label</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} />
            </div>
            <div>
              <Label>Copyright</Label>
              <Input value={copyright} onChange={(e) => setCopyright(e.target.value)} />
            </div>
            <div>
              <Label>Mood</Label>
              <Input value={mood} onChange={(e) => setMood(e.target.value)} />
            </div>
            <div>
              <Label>Visibility</Label>
              <select
                aria-label="visibility-select"
                className="w-full rounded-md bg-neutral-800 border border-neutral-700 p-2 text-white"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
              />
            </div>
            <div>
              <Label>Tags</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Separate tags with commas" />
            </div>
            <div>
              <Label>Features</Label>
              <Input value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="Featured artists" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center gap-4">
            <Label>Thumbnail *</Label>
            <div
              {...getThumbRoot()}
              className="w-full border-2 border-dashed border-neutral-700 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500"
            >
              <input {...getThumbInput()} />
              {thumbnailPreview ? (
                <Image
                  src={thumbnailPreview}
                  alt="Thumbnail Preview"
                  width={160}
                  height={100}
                  className="mx-auto rounded-lg object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-neutral-400">
                  <ImageIcon className="w-10 h-10 mb-2" />
                  <p>Click or drag to upload thumbnail</p>
                </div>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col items-center gap-4">
            <Label>Video *</Label>
            <div
              {...getVideoRoot()}
              className="w-full border-2 border-dashed border-neutral-700 rounded-xl p-6 text-center cursor-pointer hover:border-green-500"
            >
              <input {...getVideoInput()} />
              {videoFile ? (
                <p className="text-neutral-300">{videoFile.name}</p>
              ) : (
                <div className="flex flex-col items-center text-neutral-400">
                  <Upload className="w-10 h-10 mb-2" />
                  <p>Click or drag to upload video</p>
                </div>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Review Details</h3>
            <div className="text-sm space-y-1">
              <p><strong>Title:</strong> {title}</p>
              <p><strong>Artist:</strong> {artist}</p>
              <p><strong>Videographer:</strong> {videographer}</p>
              <p><strong>Genre:</strong> {genre}</p>
              <p><strong>Visibility:</strong> {visibility}</p>
            </div>

            {thumbnailPreview && (
              <Image
                src={thumbnailPreview}
                alt="Thumbnail"
                width={180}
                height={110}
                className="rounded-lg object-cover"
              />
            )}

            {videoFile && <p className="text-sm"><strong>Video File:</strong> {videoFile.name}</p>}

            {uploading && (
  <div className="space-y-2 mt-4">
    <Progress
      value={uploadProgress}
      className="h-2 bg-neutral-800 transition-all duration-300"
    />
    <p className="text-xs text-neutral-400 text-center">
      Uploading... {uploadProgress}%
    </p>
  </div>
)}

          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-neutral-900 border border-neutral-800 text-white rounded-2xl shadow-md max-w-3xl mx-auto p-2 sm:p-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Video className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />
            Upload Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Steps indicator */}
          <div className="flex justify-between text-xs sm:text-sm mb-6">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 text-center ${
                  step === s
                    ? "text-blue-500 font-bold"
                    : step > s
                    ? "text-green-500"
                    : "text-neutral-600"
                }`}
              >
                {step > s ? (
                  <CheckCircle2 className="mx-auto w-4 h-4 sm:w-5 sm:h-5 mb-1" />
                ) : (
                  <span className="inline-flex items-center justify-center w-5 h-5 border border-neutral-700 rounded-full mb-1">
                    {s}
                  </span>
                )}
                Step {s}
              </div>
            ))}
          </div>

          {renderStep()}

          {/* Navigation buttons */}
          <div className="flex flex-col sm:flex-row justify-between mt-8 gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="bg-neutral-800 text-neutral-300 hover:bg-neutral-700 w-full sm:w-auto"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}
            {step < 4 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                className="ml-auto bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:ml-auto">
                {uploading && (
                  <Button
                    variant="outline"
                    onClick={handleCancelUpload}
                    className="text-red-400 border-red-600 hover:bg-red-900/20 w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  disabled={uploading}
                  onClick={handleUpload}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {uploading ? "Uploading..." : "Upload Video"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
