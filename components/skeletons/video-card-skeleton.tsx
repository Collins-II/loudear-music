"use client";

import { motion } from "framer-motion";

export default function VideoCardSkeleton() {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 220, damping: 16 }}
      className="relative w-full border-b-[4px] border-black overflow-hidden bg-white rounded-2xl cursor-pointer"
    >
      {/* Video thumbnail area */}
      <div className="relative w-full h-52 rounded-2xl overflow-hidden">
        {/* Thumbnail shimmer */}
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-2xl" />

        {/* Category badge placeholder */}
        <div className="absolute bottom-0 left-0 w-20 h-5 bg-gray-300 rounded-tr-lg animate-pulse" />

        {/* Loader placeholder circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Info section */}
      <div className="pl-2 pr-3 py-3 space-y-2">
        {/* Title + artist */}
        <div className="space-y-1">
          <div className="w-3/4 h-4 bg-gray-300 rounded-md animate-pulse" />
          <div className="w-1/2 h-3 bg-gray-200 rounded-md animate-pulse" />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 mt-2">
          <div className="w-12 h-3 bg-gray-200 rounded-md animate-pulse" />
          <div className="w-12 h-3 bg-gray-200 rounded-md animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}
