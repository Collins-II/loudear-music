"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import WysiwygEditor from "@/components/forms/wysiwyg-editor";
import {
  PlusCircle,
  Save,
  ImageIcon,
  Music2,
  Calendar,
  Video,
  Trash,
  X
} from "lucide-react";
import { useDropzone } from "react-dropzone";

interface HeroSection {
  id: number;
  title: string;
  tagline: string;
  artistName: string;
  subtitle: string;
  description: string;
  ctaMusic: string;
  ctaVideos: string;
  ctaEvents: string;
  heroImage: string;
}

export default function HeroPage() {
  const [sections, setSections] = useState<HeroSection[]>([
    {
      id: 1,
      title: "Main Hero",
      tagline: "Zambia • Afro Pop • Dancehall Vibes",
      artistName: "Rich Bizzy",
      subtitle: "The Zambian Dancehall",
      description:
        "Discover the energy of Zambia’s Afro-Pop king. From chart-topping singles to electrifying performances, Rich Bizzy brings music that makes the world dance.",
      ctaMusic: "/music",
      ctaVideos: "/videos",
      ctaEvents: "/events",
      heroImage: "/assets/images/bizzy03.jpg",
    },
  ]);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const {
    getRootProps: getCoverRoot,
    getInputProps: getCoverInput,
    isDragActive: isCoverDragActive,
  } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
        setSections(prev =>
          prev.map((s, i) => i === 0 ? { ...s, heroImage: URL.createObjectURL(file) } : s)
        );
      }
    },
  });

  const updateSection = (id: number, field: keyof HeroSection, value: string) => {
    setSections(prev => prev.map(s => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const addSection = () => {
    setSections(prev => [
      ...prev,
      {
        id: Date.now(),
        title: "New Section",
        tagline: "",
        artistName: "",
        subtitle: "",
        description: "",
        ctaMusic: "",
        ctaVideos: "",
        ctaEvents: "",
        heroImage: "",
      },
    ]);
  };

  const handleSave = async () => {
    try {
      if (!coverFile) return alert("Please upload a cover image first.");

      const formData = new FormData();
      formData.append("cover", coverFile);
      formData.append("sections", JSON.stringify(sections));

      const res = await fetch("/api/hero/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok && data.success) {
        alert("Hero section saved successfully!");
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error("[HERO_SAVE_ERR]", error);
      alert("Failed to save hero section.");
    }
  };

  const handleDelete = (id: number) => setDeleteId(id);
  const confirmDelete = () => {
    if (deleteId !== null) setSections(prev => prev.filter(s => s.id !== deleteId));
    setDeleteId(null);
  };
  const cancelDelete = () => setDeleteId(null);

  return (
    <section className="relative w-full overflow-hidden bg-background text-foreground min-h-screen px-6 pt-10 pb-24">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-extrabold text-white mb-8"
      >
        Hero Section Builder
      </motion.h1>

      <div className="space-y-10">
        {sections.map(section => (
          <motion.div
            key={section.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white/10 backdrop-blur-md p-6 rounded-2xl space-y-6 shadow-lg border border-white/20 relative"
          >
            {/* Delete Button */}
            <Button
              onClick={() => handleDelete(section.id)}
              className="absolute top-1 right-4 p-2 rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash className="w-4 h-4" />
            </Button>

            {/* Title */}
            <div className="space-y-2">
              <Label className="text-white">Section Title</Label>
              <Input
                value={section.title}
                onChange={e => updateSection(section.id, "title", e.target.value)}
                className="bg-white/80 text-black"
                placeholder="Enter section title"
              />
            </div>

            {/* Hero Image */}
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Hero Background Image
              </Label>
              <div
                {...getCoverRoot()}
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
              >
                <input {...getCoverInput()} />
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="mx-auto max-h-40 rounded-lg"
                  />
                ) : (
                  <p className="text-gray-400">
                    {isCoverDragActive
                      ? "Drop cover image here"
                      : "Drag & drop or click to upload"}
                  </p>
                )}
              </div>
            </div>

            {/* Other Inputs */}
            <InputGroup label="Tagline" value={section.tagline} onChange={v => updateSection(section.id, "tagline", v)} />
            <InputGroup label="Artist Name" value={section.artistName} onChange={v => updateSection(section.id, "artistName", v)} />
            <InputGroup label="Subtitle" value={section.subtitle} onChange={v => updateSection(section.id, "subtitle", v)} />

            <div className="space-y-2">
              <Label className="text-white">Description</Label>
              <WysiwygEditor
                value={section.description}
                onChange={val => updateSection(section.id, "description", val)}
              />
            </div>

            {/* CTA Links */}
            <div className="grid md:grid-cols-3 gap-4">
              <InputGroup label="Music Link" icon={<Music2 className="w-4 h-4" />} value={section.ctaMusic} onChange={v => updateSection(section.id, "ctaMusic", v)} />
              <InputGroup label="Videos Link" icon={<Video className="w-4 h-4" />} value={section.ctaVideos} onChange={v => updateSection(section.id, "ctaVideos", v)} />
              <InputGroup label="Events Link" icon={<Calendar className="w-4 h-4" />} value={section.ctaEvents} onChange={v => updateSection(section.id, "ctaEvents", v)} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mt-8">
        <Button
          onClick={addSection}
          className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white rounded-xl px-6 py-3 font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
        >
          <PlusCircle className="w-5 h-5" /> Add Section
        </Button>

        <Button
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-semibold flex items-center gap-2 shadow-lg"
        >
          <Save className="w-5 h-5" /> Save Changes
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4 shadow-lg"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Confirm Delete</h3>
                <Button onClick={cancelDelete} variant="ghost" className="p-1">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <p>Are you sure you want to delete this section?</p>
              <div className="flex justify-end gap-4">
                <Button onClick={cancelDelete} className="bg-gray-300 hover:bg-gray-400">
                  Cancel
                </Button>
                <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

interface InputGroupProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  icon?: React.ReactNode;
}

function InputGroup({ label, value, onChange, icon }: InputGroupProps) {
  return (
    <div className="space-y-2">
      <Label className="text-white flex items-center gap-2">{icon} {label}</Label>
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-white/80 text-black"
      />
    </div>
  );
}
