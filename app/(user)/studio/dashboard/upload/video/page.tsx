"use client";

import { motion } from "framer-motion";
import { toast } from "sonner";
import SingleVideoUploadForm from "@/components/forms/video-upload-form";

export default function UploadVideosPage() {

  return (
    <main className="bg-gradient-to-t from-black/70 via-black/80 to-black min-h-screen pb-16 pt-8 md:px-12 text-white">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-6xl mx-auto space-y-12 pt-12"
      >
        {/* 🎥 Header */}
        {/* Billboard-Style Header */}
          <div className="text-center space-y-4 px-1 md:px-6">
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

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full bg-neutral-900/40 rounded-2xl border border-neutral-700"
          >
            <SingleVideoUploadForm
              onSuccess={() => toast.success("Video uploaded successfully!")}
            />
          </motion.div>
      </motion.div>
    </main>
  );
}
