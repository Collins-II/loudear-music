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
  X,
} from "lucide-react";
import { useDropzone } from "react-dropzone";

interface PressReleaseSection {
  id: number;
  title: string;
  tagline: string;
  subtitle: string;
  body: string;
  ctaMusic: string;
  ctaVideo: string;
  ctaEvent: string;
  image: string;
}

export default function PressReleasePage() {
  const [sections, setSections] = useState<PressReleaseSection[]>([
    {
      id: 1,
      title: "New Press Release",
      tagline: "",
      subtitle: "",
      body: "",
      ctaMusic: "",
      ctaVideo: "",
      ctaEvent: "",
      image: "",
    },
  ]);

  const [files, setFiles] = useState<Record<number, File | null>>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const updateSection = (
    id: number,
    field: keyof PressReleaseSection,
    value: string
  ) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: "New Section",
        tagline: "",
        subtitle: "",
        body: "",
        ctaMusic: "",
        ctaVideo: "",
        ctaEvent: "",
        image: "",
      },
    ]);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("sections", JSON.stringify(sections));

      Object.entries(files).forEach(([id, file]) => {
        if (file) formData.append(`file-${id}`, file);
      });

      const res = await fetch("/api/press", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("Press release saved successfully!");
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error("[PRESS_RELEASE_SAVE_ERR]", err);
      alert("Failed to save press release.");
    }
  };

  const handleDelete = (id: number) => setDeleteId(id);
  const confirmDelete = () => {
    if (deleteId !== null) {
      setSections((prev) => prev.filter((s) => s.id !== deleteId));
      setFiles((prev) => {
        const updated = { ...prev };
        delete updated[deleteId];
        return updated;
      });
    }
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
        Press Release Builder
      </motion.h1>

      <div className="space-y-10">
        {sections.map((section) => (
          <PressReleaseSectionCard
            key={section.id}
            section={section}
            updateSection={updateSection}
            setFiles={setFiles}
            handleDelete={handleDelete}
          />
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
              className="bg-white text-slate-900 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-lg"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Confirm Delete</h3>
                <Button onClick={cancelDelete} variant="ghost" className="p-1">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <p>Are you sure you want to delete this section?</p>
              <div className="flex justify-end gap-4">
                <Button
                  onClick={cancelDelete}
                  className="bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
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

/* --- Child Component with its own useDropzone --- */
function PressReleaseSectionCard({
  section,
  updateSection,
  setFiles,
  handleDelete,
}: {
  section: PressReleaseSection;
  updateSection: (
    id: number,
    field: keyof PressReleaseSection,
    value: string
  ) => void;
  setFiles: React.Dispatch<
    React.SetStateAction<Record<number, File | null>>
  >;
  handleDelete: (id: number) => void;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFiles((prev) => ({ ...prev, [section.id]: file }));
        updateSection(section.id, "image", URL.createObjectURL(file));
      }
    },
  });

  return (
    <motion.div
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

      {/* Section Title */}
      <InputGroup
        label="Section Title"
        value={section.title}
        onChange={(val) => updateSection(section.id, "title", val)}
      />

      {/* Tagline & Subtitle */}
      <div className="grid md:grid-cols-2 gap-4">
        <InputGroup
          label="Tagline"
          value={section.tagline}
          onChange={(val) => updateSection(section.id, "tagline", val)}
        />
        <InputGroup
          label="Subtitle"
          value={section.subtitle}
          onChange={(val) => updateSection(section.id, "subtitle", val)}
        />
      </div>

      {/* Body */}
      <div className="space-y-2">
        <Label className="text-white">Press Release Body</Label>
        <WysiwygEditor
          value={section.body}
          onChange={(val) => updateSection(section.id, "body", val)}
        />
      </div>

      {/* Hero Image */}
      <div className="space-y-2">
        <Label className="text-white flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Cover Image
        </Label>
        <div
          {...getRootProps()}
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
        >
          <input {...getInputProps()} />
          {section.image ? (
            <img
              src={section.image}
              alt="Section preview"
              className="mx-auto max-h-40 rounded-lg"
            />
          ) : (
            <p className="text-gray-400">
              {isDragActive
                ? "Drop image here"
                : "Drag & drop or click to upload"}
            </p>
          )}
        </div>
      </div>

      {/* CTA Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <InputGroup
          label="Music Link"
          icon={<Music2 className="w-4 h-4" />}
          value={section.ctaMusic}
          onChange={(val) => updateSection(section.id, "ctaMusic", val)}
        />
        <InputGroup
          label="Video Link"
          icon={<Video className="w-4 h-4" />}
          value={section.ctaVideo}
          onChange={(val) => updateSection(section.id, "ctaVideo", val)}
        />
        <InputGroup
          label="Event Link"
          icon={<Calendar className="w-4 h-4" />}
          value={section.ctaEvent}
          onChange={(val) => updateSection(section.id, "ctaEvent", val)}
        />
      </div>
    </motion.div>
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
      <Label className="text-white flex items-center gap-2">
        {icon} {label}
      </Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white/80 text-black"
      />
    </div>
  );
}
