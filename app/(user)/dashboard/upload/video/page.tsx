"use client";

import { motion } from "framer-motion";
import { toast } from "sonner";
import SingleVideoUploadForm from "@/components/forms/video-upload-form";

export default function UploadVideosPage() {

  return (
    <main className="bg-gradient-to-t from-white via-neutral-950 to-black min-h-screen pb-16 pt-8 md:px-12 text-white">
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
    </main>
  );
}
