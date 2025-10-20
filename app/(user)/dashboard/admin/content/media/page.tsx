"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Star } from "lucide-react";
import WysiwygEditor from "@/components/forms/wysiwyg-editor";

export default function FeaturedMediaPage() {
  const [mediaItems, setMediaItems] = useState<{ _id: string; id: string; title: string; type: string; description: string; featured?: boolean }[]>([]);
  const [allMediaIds, setAllMediaIds] = useState<string[]>([]);
  const [mediaId, setMediaId] = useState("");
  const [isValidId, setIsValidId] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "music",
  });

  useEffect(() => {
    fetchMediaItems();
    fetchAllMediaIds();
  }, []);

  useEffect(() => {
    setIsValidId(allMediaIds.includes(mediaId));
  }, [mediaId, allMediaIds]);

  const fetchMediaItems = async () => {
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      setMediaItems(data);
    } catch (err) {
      console.error("Failed to fetch media", err);
    }
  };

  const fetchAllMediaIds = async () => {
    try {
      const res = await fetch("/api/media/all"); // endpoint returns all media IDs
      const data: { id: string }[] = await res.json();
      setAllMediaIds(data.map(m => m.id));
    } catch (err) {
      console.error("Failed to fetch all media IDs", err);
    }
  };

  const handleFeatured = async (mediaId: string) => {
  if (!mediaId || !/^[0-9a-fA-F]{24}$/.test(mediaId)) {
    return alert("Please enter a valid media ObjectId");
  }

  try {
    const res = await fetch(`/api/media/featured/${mediaId}`, {
      method: "PUT",
    });

    if (!res.ok) throw new Error("Failed to update featured media");

    const updated = await res.json();
    setMediaItems(updated);
    alert("Featured media updated successfully!");
  } catch (err) {
    console.error("[FEATURED_UPDATE_ERR]", err);
    alert("Failed to update featured media");
  }
};


  return (
    <section className="relative w-full min-h-screen bg-background text-foreground px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-extrabold text-center mb-12"
        >
          🎯 Featured Media Manager
        </motion.h1>

        {/* Media Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 space-y-6 mb-12">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-white">Title</Label>
            <Input
              name="title"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter media title"
              className="bg-white/80 text-black"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-white">Description</Label>
            <WysiwygEditor
              value={form.description}
              onChange={(value: string) => setForm(prev => ({ ...prev, description: value }))}
            />
          </div>

          {/* Type Selection */}
          <div>
            <Label className="text-white">Media Type</Label>
            <Select onValueChange={(value: string) => setForm(prev => ({ ...prev, type: value }))} defaultValue={form.type}>
              <SelectTrigger className="bg-white/80 text-black rounded-xl">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="music">🎵 Music</SelectItem>
                <SelectItem value="video">🎬 Video</SelectItem>
                <SelectItem value="image">🖼️ Image</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Media ID Input */}
          <div className="space-y-2">
            <Label className="text-white">Media Object ID</Label>
            <Input
              value={mediaId}
              onChange={(e) => setMediaId(e.target.value)}
              placeholder="Paste media object ID here"
              className={`bg-white/80 text-black ${!isValidId && mediaId ? "border-red-500 border-2" : ""}`}
            />
            {!isValidId && mediaId && <p className="text-red-400 text-sm">Invalid media ID</p>}
          </div>

          {/* Update Featured Button */}
          <Button
            onClick={() => handleFeatured}
            disabled={!isValidId}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 text-white rounded-xl px-6 py-3 font-semibold flex items-center gap-2 shadow-lg"
          >
            <Star className="w-5 h-5" /> Update Featured Media
          </Button>
        </div>

        {/* Featured Media List */}
        <div className="grid gap-6">
          {mediaItems.map(item => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                {item.featured && <Star className="w-5 h-5 text-yellow-400" />}
              </div>
              <p className="text-sm text-white/80">Type: {item.type}</p>
              <p className="text-sm text-white/80">{item.description}</p>
              <p className="text-indigo-300 underline">Media ID: {item.id}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
