"use client";

import { motion } from "framer-motion";

export default function MusicCardSkeleton() {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden border-b-[4px] border-black bg-white rounded-none sm:rounded-none shadow-sm animate-pulse"
    >
      {/* Cover Image Placeholder */}
      <div className="relative h-56 w-full sm:h-60 bg-gray-300/30 dark:bg-neutral-800">
        {/* Genre Tag Placeholder */}
        <div className="absolute -bottom-3 left-0 md:-bottom-4 md:right-0 bg-black/20 text-transparent px-2 md:px-4 py-0.5 md:py-1 rounded"></div>

        {/* Trending + Rank Badges */}
        <div className="absolute top-2 left-2 w-20 h-5 bg-gray-300/40 rounded-full"></div>
        <div className="absolute top-2 right-2 w-10 h-5 bg-gray-300/40 rounded-full"></div>
      </div>

      {/* Card Content */}
      <div className="py-4 space-y-2 pl-2 pr-4">
        {/* Artist + Date row */}
        <div className="h-3 w-2/3 bg-gray-300/40 dark:bg-neutral-700 rounded"></div>

        {/* Title */}
        <div className="h-5 w-11/12 bg-gray-300/30 dark:bg-neutral-700 rounded"></div>
        <div className="h-5 w-2/3 bg-gray-300/20 dark:bg-neutral-800 rounded"></div>

        {/* Stats Row */}
        <div className="flex justify-between items-center mt-3">
          <div className="h-3 w-16 bg-gray-300/30 dark:bg-neutral-700 rounded"></div>
          <div className="h-3 w-16 bg-gray-300/30 dark:bg-neutral-700 rounded"></div>
        </div>
      </div>
    </motion.div>
  );
}
