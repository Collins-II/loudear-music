"use client";

import { motion } from "framer-motion";
import { toast } from "sonner";
import AlbumUploadForm from "@/components/forms/album-upload-form";

export default function UploadMusicPage() {

  return (
    <main className="bg-gradient-to-t from-white via-neutral-950 to-black min-h-screen pt-8 pb-16 md:px-12 text-white">
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
              Upload Album
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
        </motion.div>

            <AlbumUploadForm onSuccess={() => toast.success("Album uploaded successfully!")} />
      </motion.div>
    </main>
  );
}
