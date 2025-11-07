"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusCircle,
  Save,
  ImageIcon,
  Trash,
  X,
} from "lucide-react";
import Image from "next/image";

interface GalleryItem {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  //const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
       // setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
    },
  });

  const addItem = () => {
    if (!imagePreview) return alert("Upload an image first");
    setItems(prev => [
      ...prev,
      {
        id: Date.now(),
        imageUrl: imagePreview,
        title: "Untitled",
        description: "",
      },
    ]);
    //setImageFile(null);
    setImagePreview("");
  };

  const updateItem = (id: number, field: keyof GalleryItem, value: string) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        body: JSON.stringify(items),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Gallery saved successfully!");
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error("[GALLERY_SAVE_ERR]", err);
      alert("Failed to save gallery");
    }
  };

  const handleDelete = (id: number) => setDeleteId(id);
  const confirmDelete = () => {
    if (deleteId !== null)
      setItems(prev => prev.filter(item => item.id !== deleteId));
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
        Gallery Manager
      </motion.h1>

      {/* Upload Zone */}
      <div className="space-y-4 mb-10">
        <Label className="text-white flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Upload Image
        </Label>
        <div
          {...getRootProps()}
          className="relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer bg-white/10"
        >
          <input {...getInputProps()} />
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="Preview"
              fill
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

        <Button
          onClick={addItem}
          className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white rounded-xl px-6 py-3 font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
        >
          <PlusCircle className="w-5 h-5" /> Add to Gallery
        </Button>
      </div>

      {/* Gallery Items */}
      <div className="space-y-10">
        {items.map(item => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white/10 backdrop-blur-md p-6 rounded-2xl space-y-6 shadow-lg border border-white/20 relative"
          >
            {/* Delete Button */}
            <Button
              onClick={() => handleDelete(item.id)}
              className="absolute top-1 right-4 p-2 rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash className="w-4 h-4" />
            </Button>

            {/* Image Preview */}
            <div className="relative flex justify-center">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="max-h-48 rounded-lg"
              />
            </div>

            <InputGroup
              label="Title"
              value={item.title}
              onChange={v => updateItem(item.id, "title", v)}
            />
            <div className="space-y-2">
              <Label className="text-white">Description</Label>
              <Textarea
                value={item.description}
                onChange={e =>
                  updateItem(item.id, "description", e.target.value)
                }
                className="bg-white/80 text-black"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mt-8">
        <Button
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-semibold flex items-center gap-2 shadow-lg"
        >
          <Save className="w-5 h-5" /> Save Gallery
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
              className="bg-white text-slate-700 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-lg"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Confirm Delete</h3>
                <Button onClick={cancelDelete} variant="ghost" className="p-1">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <p>Are you sure you want to delete this gallery item?</p>
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

interface InputGroupProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

function InputGroup({ label, value, onChange }: InputGroupProps) {
  return (
    <div className="space-y-2">
      <Label className="text-white">{label}</Label>
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-white/80 text-black"
      />
    </div>
  );
}
