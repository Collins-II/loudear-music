"use client";

import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Info, Loader2, UploadCloud, Undo2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "../ui/checkbox";

interface ArtistProfileEditProps {
  user: {
    _id: string;
    name: string;
    email: string;
    image?: string;
    bio?: string;
    location?: string;
    phone?: string;
    role?: string;
    genres?: string[];
  };
  onSuccess?: () => void;
}

export default function ProfileEditForm({ user, onSuccess }: ArtistProfileEditProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(user?.image || "");
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [role, setRole] = useState(user?.role || "");
  const [genres, setGenres] = useState((user?.genres || []).join(", "));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  // ✅ FIX: define MotionDiv to bypass type conflict with HTML props
  const MotionDiv = motion.div as any;

  // Detect unsaved changes
  useEffect(() => {
    const hasChanges =
      name !== user?.name ||
      bio !== user?.bio ||
      location !== user?.location ||
      phone !== user?.phone ||
      genres !== (user?.genres || []).join(", ") ||
      imageFile !== null;

    setDirty(hasChanges);
  }, [name, bio, location, phone, genres, imageFile, user]);

  // Reset to initial
  const handleReset = () => {
    setName(user?.name || "");
    setBio(user?.bio || "");
    setLocation(user?.location || "");
    setPhone(user?.phone || "");
    setGenres((user?.genres || []).join(", "));
    setImageFile(null);
    setImagePreview(user?.image || "");
    setDirty(false);
  };

  // Dropzone setup
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: (files) => {
      const file = files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required.";
    if (bio.length > 2000) newErrors.bio = "Bio is too long.";
    if (location.length > 200) newErrors.location = "Location too long.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);
      formData.append("location", location);
      formData.append("phone", phone);
      formData.append("role", role);
      formData.append(
        "genres",
        JSON.stringify(genres.split(",").map((g) => g.trim()).filter(Boolean))
      );
      if (imageFile) formData.append("image", imageFile);

      const response = await fetch("/api/users/update", {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Update failed");
      }

      toast.success("Profile updated successfully!");
      onSuccess?.();
      setDirty(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error updating profile");
    } finally {
      setUploading(false);
    }
  };

  return (
    <MotionDiv initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      {/* 🔥 Unsaved changes banner */}
      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 rounded-lg border border-amber-500 bg-amber-500/10 p-3 text-center text-sm text-amber-300 flex items-center justify-between"
          >
            <span>You have unsaved changes</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-amber-300 hover:bg-amber-500/20"
              >
                <Undo2 className="w-4 h-4 mr-1" /> Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={uploading}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                {uploading ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-1" />
                ) : null}
                Save Changes
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="rounded-2xl border border-neutral-800 bg-neutral-900/80 text-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            Edit Artist Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <MotionDiv
            {...getRootProps()}
            className="border-2 border-dashed border-neutral-700 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500"
          >
            <input {...getInputProps()} />
            <AnimatePresence mode="wait">
              {imagePreview ? (
                <motion.div
                  key={imagePreview}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={imagePreview}
                    width={120}
                    height={120}
                    alt="Profile preview"
                    className="mx-auto rounded-full object-cover shadow-md"
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center text-neutral-400"
                >
                  <UploadCloud className="w-8 h-8 mb-2" />
                  <p>Upload profile photo</p>
                </motion.div>
              )}
            </AnimatePresence>
          </MotionDiv>
                    <div className="flex items-start gap-3">
            <Checkbox
              id="artist-role"
              checked={role === "artist"}
              onCheckedChange={(checked) =>
                setRole( checked ? "artist" : "fan")
              }
            />
            <div className="grid gap-2">
              <Label htmlFor="artist-role">Are you an artist?</Label>
              <p className="text-sm text-neutral-400">
                Confirming lets you upload original visual content.
              </p>
            </div>
          </div>
          {/* Name */}
          <div>
            <Label className="text-neutral-300">Full Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-white"
              placeholder="Enter your name"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* Bio */}
          <div>
            <Label className="flex items-center gap-2 text-neutral-300">
              <Info className="w-4 h-4" /> Bio
            </Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-white"
              rows={5}
              placeholder="Tell fans about yourself..."
            />
            {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
          </div>

          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-neutral-300">Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
                placeholder="City, Country"
              />
            </div>
            <div>
              <Label className="text-neutral-300">Phone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
                placeholder="+260 97 123 4567"
              />
            </div>
          </div>

          {/* Genres */}
          <div>
            <Label className="text-neutral-300">Genres (comma separated)</Label>
            <Input
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-white"
              placeholder="Hip-Hop, Pop, Jazz..."
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={uploading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
          >
            {uploading && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
            {uploading ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>
    </MotionDiv>
  );
}
