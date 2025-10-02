"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Video, ImageIcon, CheckCircle2, Loader2, Calendar, Tag, Info, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import cloudinary from "@/lib/cloudinary";
import { uploadToCloudinary } from "@/lib/helpers";

interface VideoUploadFormProps {
  onSuccess?: () => void;
}

// Convert File to Buffer
async function bufferFromFile(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export default function VideoUploadForm({ onSuccess }: VideoUploadFormProps) {
  const [step, setStep] = useState(1);

  // Fields
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [videographer, setVideographer] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  // Files
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // States
  const [uploading, setUploading] = useState(false);

  // Dropzones
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

  // Clean up thumbnail preview
  useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [thumbnailPreview]);

  // Upload handler
  const handleUpload = async () => {
    if (!title || !artist || !videographer || !videoFile || !thumbnail) {
      toast.error("Please complete all required fields.");
      return;
    }

  let thumbResult: string | undefined;
let videoUrl: string | undefined;

setUploading(true);

if (thumbnail) {
  const thumbUpload = await uploadToCloudinary(
    thumbnail,
    "videos/thumbnails",
    "image"
  );
  thumbResult = thumbUpload.secure_url;
}

if (videoFile) {
  const videoUpload = await uploadToCloudinary(
    videoFile,
    "videos/files",
    "video"
  );
  videoUrl = videoUpload.secure_url;
}
  
    
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("artist", artist);
      formData.append("videographer", videographer);
      formData.append("genre", genre);
      formData.append("releaseDate", releaseDate);
      formData.append("description", description);
      formData.append("tags", tags);
      formData.append("video", videoUrl as string);
      formData.append("thumbnail", thumbResult as string);

      const res = await fetch(`/api/videos/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      toast.success("Video uploaded successfully!");
      onSuccess?.();
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Error uploading video");
    } finally {
      setUploading(false);
    }
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
    setVideoFile(null);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnail(null);
    setThumbnailPreview(null);
  };

  // Step renderer
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-neutral-300">Title *</Label>
              <Input className="bg-neutral-800 border-neutral-700 text-white" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label className="text-neutral-300">Artist *</Label>
              <Input className="bg-neutral-800 border-neutral-700 text-white" value={artist} onChange={(e) => setArtist(e.target.value)} />
            </div>
            <div>
              <Label className="text-neutral-300">Genre *</Label>
              <Input className="bg-neutral-800 border-neutral-700 text-white" value={genre} onChange={(e) => setGenre(e.target.value)} />
            </div>
            <div>
              <Label className="text-neutral-300">Videographer *</Label>
              <Input className="bg-neutral-800 border-neutral-700 text-white" value={videographer} onChange={(e) => setVideographer(e.target.value)} />
            </div>
            <div>
              <Label className="flex items-center gap-2 text-neutral-300"><Calendar className="w-4 h-4" /> Release Date</Label>
              <Input className="bg-neutral-800 border-neutral-700 text-white" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label className="flex items-center gap-2 text-neutral-300"><Info className="w-4 h-4" /> Description</Label>
              <Textarea className="bg-neutral-800 border-neutral-700 text-white" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label className="flex items-center gap-2 text-neutral-300"><Tag className="w-4 h-4" /> Tags</Label>
              <Input className="bg-neutral-800 border-neutral-700 text-white" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <Label className="text-neutral-300">Thumbnail *</Label>
            <div {...getThumbRoot()} className="border-2 border-dashed border-neutral-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500">
              <input {...getThumbInput()} />
              {thumbnailPreview ? (
                <img src={thumbnailPreview} className="w-48 h-32 object-cover rounded-lg shadow-md" alt="Thumbnail Preview" />
              ) : (
                <div className="flex flex-col items-center text-neutral-400">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <p>Drag & drop or click to upload thumbnail</p>
                </div>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <Label className="text-neutral-300">Video *</Label>
            <div {...getVideoRoot()} className="border-2 border-dashed border-neutral-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-green-500">
              <input {...getVideoInput()} />
              {videoFile ? <p className="text-neutral-200">{videoFile.name}</p> : <Upload className="w-12 h-12 text-neutral-400 mb-2" />}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 text-neutral-200">
            <h3 className="font-semibold text-lg">Review Video</h3>
            <p><span className="font-medium">Title:</span> {title}</p>
            <p><span className="font-medium">Artist:</span> {artist}</p>
            <p><span className="font-medium">Videographer:</span> {videographer}</p>
            {genre && <p><span className="font-medium">Genre:</span> {genre}</p>}
            {releaseDate && <p><span className="font-medium">Release Date:</span> {releaseDate}</p>}
            {tags && <p><span className="font-medium">Tags:</span> {tags}</p>}
            {description && <p className="text-neutral-400">{description}</p>}
            {thumbnailPreview && <img src={thumbnailPreview} className="w-40 h-28 rounded-lg shadow-md object-cover" alt="Thumbnail" />}
            {videoFile && <p>{videoFile.name}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="rounded-2xl border-none md:border md:border-neutral-800 bg-neutral-900/80 text-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2 text-white">
            <Video className="w-6 h-6 text-blue-500" /> Upload New Video
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stepper */}
          <div className="flex items-center justify-between text-sm">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`flex-1 flex flex-col items-center ${step === s ? "font-bold text-blue-500" : step > s ? "text-green-500" : "text-neutral-600"}`}>
                {step > s ? <CheckCircle2 className="w-5 h-5 mb-1" /> : <span className="w-5 h-5 rounded-full border border-neutral-600 flex items-center justify-center mb-1">{s}</span>}
                Step {s}
              </div>
            ))}
          </div>

          {/* Step content */}
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="bg-black flex items-center gap-1 border-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            )}
            {step < 4 ? (
              <Button onClick={() => setStep((s) => s + 1)} className="ml-auto flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleUpload} disabled={uploading} className="ml-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                {uploading ? "Uploading..." : "Upload Video"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
