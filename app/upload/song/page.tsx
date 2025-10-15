"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Disc, Info, User } from "lucide-react";
import { toast } from "sonner";
import SingleUploadForm from "@/components/forms/single-upload-form";
import AlbumUploadForm from "@/components/forms/album-upload-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { IUser } from "@/lib/database/models/user";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function UploadMusicPage() {
  const { data: session } = useSession();
  const userData = session?.user;
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

  // ✅ Determine if the profile is complete
  useEffect(() => {
    if (!user) return;
    /*const complete =
      user.role === "artist" &&
      !!user.bio &&
      !!user.location &&
      !!user.phone &&
      Array.isArray(user.genres) &&
      user.genres.length > 0;*/
    if( user.role === "artist" ) setIsProfileComplete(true);
  }, [user]);

  // ✅ Handlers
  const handleUpdateProfile = () => setShowProfileModal(true);

  const handleAddGenre = () => {
    if (genreInput.trim() && !formData.genres.includes(genreInput.trim())) {
      setFormData({
        ...formData,
        genres: [...formData.genres, genreInput.trim()],
      });
      setGenreInput("");
    }
  };

  // ✅ Save profile — only allow "artist" role
  const handleSaveProfile = async () => {
    if (formData.role !== "artist") {
      toast.error("Only users with the 'artist' role can update artist profiles.");
      return;
    }

    if (
      !formData.bio ||
      !formData.location ||
      !formData.phone ||
      formData.genres.length === 0
    ) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      setIsUploading(true)
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
      setIsUploading(false)
      toast.success("Profile updated successfully!");
      setShowProfileModal(false);
    } catch (error: any) {
      setIsUploading(false)
      toast.error(error.message || "Something went wrong");
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
        {/* Header Section */}
        <div className="text-center space-y-4 px-6">
          <div className="w-full flex gap-2 items-center">
              <span className="w-full h-[8px] bg-white -z-0"></span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Upload Music
            </h1>
            <span className="w-full h-[8px] bg-white -z-0"></span>
            </div>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
            Share your sound with the world — get your singles and albums live on the platform.
          </p>
        </div>

        {/* Notice */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-yellow-50/10 border border-yellow-500/30 rounded-2xl p-6 text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-2 text-yellow-400 font-medium">
            <Info className="w-5 h-5" />
            <span>Important Notice</span>
          </div>
          <p className="text-neutral-300 text-sm max-w-2xl mx-auto">
            All uploaded content will undergo a short review by our team to ensure quality and compliance
            before being published.
          </p>
        </motion.div>

        {/* Conditional Upload Section */}
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
              To upload music, please complete your artist profile by adding a short bio,
              your location, phone number, and preferred genres.
            </p>
            <Button
              onClick={handleUpdateProfile}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-semibold"
            >
              Complete Profile
            </Button>
          </motion.div>
        ) : (
          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid grid-cols-2 gap-2 max-w-md mx-auto mb-8 bg-neutral-800/80 p-2 rounded-xl border border-neutral-700">
              <TabsTrigger
                value="single"
                className={cn(
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg px-6 py-3 flex items-center gap-2 text-lg font-semibold text-neutral-400 hover:text-white transition"
                )}
              >
                <Music className="w-5 h-5" /> Single
              </TabsTrigger>
              <TabsTrigger
                value="album"
                className={cn(
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg px-6 py-3 flex items-center gap-2 text-lg font-semibold text-neutral-400 hover:text-white transition"
                )}
              >
                <Disc className="w-5 h-5" /> Album
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single">
              <SingleUploadForm onSuccess={() => toast.success("Single uploaded successfully!")} />
            </TabsContent>
            <TabsContent value="album">
              <AlbumUploadForm onSuccess={() => toast.success("Album uploaded successfully!")} />
            </TabsContent>
          </Tabs>
        )}
      </motion.div>

      {/* 🧾 Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="bg-neutral-900 border border-neutral-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Complete Your Artist Profile</DialogTitle>
          </DialogHeader>

          {/* Artist Role Checkbox */}
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
              <p className="text-muted-foreground text-sm">
                By confirming, you acknowledge being the creator and owner of uploaded content.
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

            {/* Genres Input */}
            <div>
              <label className="text-sm font-semibold text-neutral-300">Genres</label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add a genre (e.g., Hip Hop)"
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
              {isUploading ? "Saving" : "Save Profile" }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
