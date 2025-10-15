"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Info, User} from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import SingleVideoUploadForm from "@/components/forms/video-upload-form";
import { IUser } from "@/lib/database/models/user";
import { redirect } from "next/navigation";

export default function UploadVideosPage() {
  const { data: session } = useSession();
  const userData = session?.user;
  if (!session) {
    redirect("/")
  }
  const [user, setUser] = useState<IUser | null>(userData as IUser);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    role: userData?.role || "",
    bio: userData?.bio || "",
    location: userData?.location || "",
    phone: userData?.phone?.toString() || "",
    genres: (userData?.genres as string[]) || [],
  });
  const [genreInput, setGenreInput] = useState("");

  //if(user?.role === "artist") setIsProfileComplete(true);

useEffect(() => {
  if (!user) return;

  // Normalize genres (split if it's a comma-separated string)
  /*const genresArray = Array.isArray(user.genres)
    ? user.genres.flatMap((g) =>
        typeof g === "string" ? g.split(",").map((x) => x.trim()) : []
      )
    : [];

  const complete = 
    user.role === "artist" &&
    !!user.bio?.trim() &&
    !!user.location?.trim() &&
    !!user.phone*/

  if(user.role === "artist") setIsProfileComplete(true);
}, [user]);


  const handleAddGenre = () => {
    if (genreInput.trim() && !formData.genres.includes(genreInput.trim())) {
      setFormData({
        ...formData,
        genres: [...formData.genres, genreInput.trim()],
      });
      setGenreInput("");
    }
  };

  const handleSaveProfile = async () => {
    if (formData.role !== "artist") {
      toast.error("Only artist accounts can upload videos.");
      return;
    }

    if (
      !formData.bio ||
      !formData.location ||
      !formData.phone ||
      formData.genres.length === 0
    ) {
      toast.error("Please complete all required profile fields.");
      return;
    }

    try {
      setIsUploading(true);
      const res = await fetch("/api/users/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setUser({
        ...user!,
        ...formData,
        phone: Number(formData.phone),
      } as IUser);

      toast.success("Profile updated successfully!");
      setShowProfileModal(false);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="bg-gradient-to-t from-white via-neutral-950 to-black min-h-screen py-16 md:px-12 text-white">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-6xl mx-auto space-y-12 pt-12"
      >
        {/* 🎥 Header */}
        {/* Billboard-Style Header */}
          <div className="text-center space-y-4 px-6">
            <div className="w-full flex gap-2 items-center">
              <span className="w-full h-[8px] bg-white -z-0"></span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Upload Video
            </h1>
            <span className="w-full h-[8px] bg-white -z-0"></span>
            </div>
            <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
              Share your music videos and visual albums. Let the world see your art in motion.
            </p>
          </div>
      

        {/* ℹ️ Notice */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-yellow-50/10 border border-yellow-500/30 rounded-2xl p-6 text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-2 text-yellow-400 font-medium">
            <Info className="w-5 h-5" />
            <span>Video Review Policy</span>
          </div>
          <p className="text-neutral-300 text-sm max-w-2xl mx-auto">
            Uploaded videos undergo a short review process to ensure quality and compliance.
          </p>
        </motion.div>

        {/* 🧾 Ad Block (Google Ads Placeholder) */}
        <div className="bg-neutral-800/60 rounded-xl p-6 text-center border border-neutral-700 shadow-md">
          <p className="text-gray-400 font-semibold">Sponsored</p>
          <div className="mt-3">
            <ins
              className="adsbygoogle block"
              data-ad-client="ca-pub-XXXXXXXXXXXXXX"
              data-ad-slot="1234567890"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>
        </div>

        {/* 🎬 Upload Form Section */}
        {!isProfileComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-red-500/10 border border-red-600/40 p-8 rounded-2xl text-center space-y-4"
          >
            <User className="w-10 h-10 mx-auto text-red-400" />
            <h2 className="text-xl font-semibold text-red-300">
              Complete Your Artist Profile
            </h2>
            <p className="text-neutral-400 max-w-md mx-auto">
              To upload videos, please complete your artist profile by adding your bio,
              location, contact number, and genres.
            </p>
            <Button
              onClick={() => setShowProfileModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-semibold"
            >
              Complete Profile
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full bg-neutral-900/40 rounded-2xl p-8 border border-neutral-700"
          >
            <SingleVideoUploadForm
              onSuccess={() => toast.success("Video uploaded successfully!")}
            />
          </motion.div>
        )}

        {/* 🧾 Bottom Ad Section */}
        <div className="bg-neutral-800/60 rounded-xl p-6 text-center border border-neutral-700 shadow-md">
          <p className="text-gray-400 font-semibold">Sponsored</p>
          <div className="mt-3">
            <ins
              className="adsbygoogle block"
              data-ad-client="ca-pub-XXXXXXXXXXXXXX"
              data-ad-slot="0987654321"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>
        </div>
      </motion.div>

      {/* 🧾 Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="bg-neutral-900 border border-neutral-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Complete Artist Profile</DialogTitle>
          </DialogHeader>

          <div className="flex items-start gap-3">
            <Checkbox
              id="artist-role"
              checked={formData.role === "artist"}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, role: checked ? "artist" : "" })
              }
            />
            <div className="grid gap-2">
              <Label htmlFor="artist-role">Are you an artist?</Label>
              <p className="text-sm text-neutral-400">
                Confirming lets you upload original visual content.
              </p>
            </div>
          </div>

          <div className="space-y-4 py-2">
            <Textarea
              placeholder="Your artist bio..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
            <Input
              placeholder="Location (e.g., Lusaka, Zambia)"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <Input
              placeholder="Phone Number"
              type="number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            {/* 🎵 Genres */}
            <div>
              <label className="text-sm font-semibold text-neutral-300">Genres</label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add a genre (e.g., Afrobeats)"
                  value={genreInput}
                  onChange={(e) => setGenreInput(e.target.value)}
                />
                <Button onClick={handleAddGenre} variant="secondary">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.genres.map((g) => (
                  <Badge key={g} variant="outline" className="text-sm">
                    {g}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleSaveProfile}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
            >
              {isUploading ? "Saving..." : "Save Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
