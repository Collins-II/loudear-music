"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import Image from "next/image";
import { toast } from "sonner";
import {
  Upload,
  Video,
  ImageIcon,
  CheckCircle2,
  Loader2,
  Info,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadToCloudinary } from "@/lib/helpers";

// ---------- Types ----------
interface VideoUploadFormProps {
  onSuccess?: () => void;
  existingVideo?: Partial<FormState>;
  isEdit?: boolean;
}

interface FormState {
  _id?: string;
  title: string;
  artist: string;
  features: string[];
  genre: string;
  releaseDate?: string;
  description?: string;
  tags: string[];
  videographer?: string;
  label?: string;
  copyright?: string;
  mood?: string;
  visibility: "public" | "private" | "unlisted";
  thumbnailUrl?: string;
  videoUrl?: string;
}

// ---------- Component ----------
export default function VideoUploadForm({
  onSuccess,
  existingVideo,
  isEdit = false,
}: VideoUploadFormProps) {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ✅ Initialize form
  const [form, setForm] = useState<FormState>({
    title: existingVideo?.title || "",
    artist: existingVideo?.artist || "",
    features: existingVideo?.features || [],
    genre: existingVideo?.genre || "",
    releaseDate: existingVideo?.releaseDate || "",
    description: existingVideo?.description || "",
    tags: existingVideo?.tags || [],
    videographer: existingVideo?.videographer || "",
    label: existingVideo?.label || "",
    copyright: existingVideo?.copyright || "",
    mood: existingVideo?.mood || "",
    visibility: existingVideo?.visibility || "private",
    thumbnailUrl: existingVideo?.thumbnailUrl || "",
    videoUrl: existingVideo?.videoUrl || "",
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    existingVideo?.thumbnailUrl || null
  );

  // ✅ Dropzones
  const { getRootProps: getVideoRoot, getInputProps: getVideoInput } =
    useDropzone({
      accept: { "video/*": [] },
      multiple: false,
      onDrop: (files) => setVideoFile(files[0]),
    });

  const { getRootProps: getThumbRoot, getInputProps: getThumbInput } =
    useDropzone({
      accept: { "image/*": [] },
      multiple: false,
      onDrop: (files) => {
        const file = files[0];
        if (file) {
          setThumbnail(file);
          setThumbnailPreview(URL.createObjectURL(file));
        }
      },
    });

  // Cleanup
  useEffect(() => {
    return () => {
      if (thumbnailPreview?.startsWith("blob:")) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [thumbnailPreview]);

  // ✅ Handle input change
  const handleChange = (key: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleArrayInput = (key: "features" | "tags", value: string) => {
    const arr = value.split(",").map((v) => v.trim()).filter(Boolean);
    setForm((prev) => ({ ...prev, [key]: arr }));
  };

  // ✅ Upload handler
  const handleUpload = async () => {
    if (!form.title || !form.artist || !form.genre) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!isEdit && (!videoFile || !thumbnail)) {
      toast.error("Please upload both a thumbnail and video file.");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(10);

      let thumbnailUrl = form.thumbnailUrl;
      let videoUrl = form.videoUrl;

      // Upload thumbnail
      if (thumbnail) {
        setUploadProgress(30);
        const uploadRes = await uploadToCloudinary(thumbnail, "videos/thumbnails", "image");
        thumbnailUrl = uploadRes.secure_url;
      }

      // Upload video
      if (videoFile) {
        setUploadProgress(65);
        const uploadRes = await uploadToCloudinary(videoFile, "videos/files", "video");
        videoUrl = uploadRes.secure_url;
      }

      setUploadProgress(85);

      const payload = {
        ...form,
        thumbnailUrl,
        videoUrl,
      };

      const method = isEdit ? "PUT" : "POST";
      const endpoint = isEdit
        ? `/api/videos/upload?id=${existingVideo?._id}`
        : `/api/videos/upload`;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setUploadProgress(100);
      toast.success(isEdit ? "Video updated successfully!" : "Video uploaded successfully!");
      onSuccess?.();
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Error uploading video");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setStep(1);
    setForm({
      title: "",
      artist: "",
      features: [],
      genre: "",
      releaseDate: "",
      description: "",
      tags: [],
      videographer: "",
      label: "",
      copyright: "",
      mood: "",
      visibility: "private",
    });
    setVideoFile(null);
    setThumbnail(null);
    setThumbnailPreview(null);
  };

  // ✅ Step renderer
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <TextField label="Title *" value={form.title} onChange={(v) => handleChange("title", v)} />
            <TextField label="Artist *" value={form.artist} onChange={(v) => handleChange("artist", v)} />
            <TextField label="Features (comma-separated)" value={form.features.join(", ")} onChange={(v) => handleArrayInput("features", v)} />
            <TextField label="Genre *" value={form.genre} onChange={(v) => handleChange("genre", v)} />
            <TextField label="Videographer" value={form.videographer || ""} onChange={(v) => handleChange("videographer", v)} />
            <TextField label="Label" value={form.label || ""} onChange={(v) => handleChange("label", v)} />
            <TextField label="Copyright" value={form.copyright || ""} onChange={(v) => handleChange("copyright", v)} />
            <TextField label="Mood" value={form.mood || ""} onChange={(v) => handleChange("mood", v)} />
            <div>
              <Label className="text-neutral-300">Release Date</Label>
              <Input
                type="date"
                className="bg-neutral-800 border-neutral-700 text-white"
                value={form.releaseDate || ""}
                onChange={(e) => handleChange("releaseDate", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-neutral-300 flex gap-2 items-center">
                <Shield className="w-4 h-4" /> Visibility
              </Label>
              <Select
                value={form.visibility}
                onValueChange={(v: "public" | "private" | "unlisted") => handleChange("visibility", v)}
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className="flex items-center gap-2 text-neutral-300">
                <Info className="w-4 h-4" /> Description
              </Label>
              <Textarea
                className="bg-neutral-800 border-neutral-700 text-white"
                value={form.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
            <TextField
              label="Tags (comma-separated)"
              value={form.tags.join(", ")}
              onChange={(v) => handleArrayInput("tags", v)}
            />
          </div>
        );

      case 2:
        return (
          <FileDropZone
            label="Thumbnail *"
            accept="image"
            filePreview={thumbnailPreview}
            getRootProps={getThumbRoot}
            getInputProps={getThumbInput}
            icon={<ImageIcon className="w-10 h-10 text-neutral-400" />}
          />
        );

      case 3:
        return (
          <FileDropZone
            label="Video *"
            accept="video"
            filePreview={videoFile?.name}
            getRootProps={getVideoRoot}
            getInputProps={getVideoInput}
            icon={<Upload className="w-10 h-10 text-neutral-400" />}
          />
        );

      case 4:
        return (
          <div className="space-y-3 text-neutral-200">
            <h3 className="text-lg font-semibold">Review Details</h3>
            {Object.entries(form).map(
              ([key, val]) =>
                val && (
                  <p key={key}>
                    <span className="capitalize font-medium">{key}:</span>{" "}
                    {Array.isArray(val) ? val.join(", ") : val}
                  </p>
                )
            )}
            {thumbnailPreview && (
              <Image
                width={200}
                height={120}
                src={thumbnailPreview}
                alt="Thumbnail"
                className="rounded-lg object-cover shadow-md"
              />
            )}
            {videoFile && <p>{videoFile.name}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  // ---------- UI ----------
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="rounded-2xl bg-neutral-900/80 text-white border border-neutral-800 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-white">
            <Video className="w-6 h-6 text-blue-500" />
            {isEdit ? "Edit Video" : "Upload New Video"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stepper */}
          <Stepper current={step} />
          {renderStep()}

          {uploading && (
            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div
                className={`bg-blue-500 h-2 transition-all w-${uploadProgress}%}`}
              />
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1 bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            )}
            {step < 4 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
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
                {uploading ? "Uploading..." : isEdit ? "Update Video" : "Upload Video"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------- Helper Components ----------
const TextField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div>
    <Label className="text-neutral-300">{label}</Label>
    <Input
      className="bg-neutral-800 border-neutral-700 text-white"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const Stepper = ({ current }: { current: number }) => (
  <div className="flex justify-between text-sm">
    {[1, 2, 3, 4].map((s) => (
      <div
        key={s}
        className={`flex-1 flex flex-col items-center ${
          current === s
            ? "text-blue-500 font-semibold"
            : current > s
            ? "text-green-500"
            : "text-neutral-600"
        }`}
      >
        {current > s ? (
          <CheckCircle2 className="w-5 h-5 mb-1" />
        ) : (
          <span className="w-5 h-5 flex items-center justify-center rounded-full border border-neutral-600 mb-1">
            {s}
          </span>
        )}
        Step {s}
      </div>
    ))}
  </div>
);

const FileDropZone = ({
  label,
  accept,
  filePreview,
  getRootProps,
  getInputProps,
  icon,
}: any) => (
  <div>
    <Label className="text-neutral-300">{label}</Label>
    <div
      {...getRootProps()}
      className={`border-2 border-dashed border-neutral-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-${accept === "video" ? "green" : "blue"}-500`}
    >
      <input {...getInputProps()} />
      {filePreview ? (
        typeof filePreview === "string" && filePreview.endsWith(".jpg") ? (
          <Image
            src={filePreview}
            alt={label}
            width={200}
            height={120}
            className="rounded-lg object-cover"
          />
        ) : (
          <p className="text-neutral-200">{filePreview}</p>
        )
      ) : (
        <div className="flex flex-col items-center text-neutral-400">
          {icon}
          <p>Click or drag & drop to upload {accept}</p>
        </div>
      )}
    </div>
  </div>
);
