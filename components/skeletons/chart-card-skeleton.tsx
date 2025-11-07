"use client";

import { motion } from "framer-motion";

export default function ChartCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className="relative w-full max-w-md overflow-hidden bg-white dark:bg-black/90 shadow-sm rounded-none sm:rounded-none animate-pulse"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Rank Badge */}
        <div className="flex items-center justify-center h-12 sm:h-auto sm:w-14 bg-gray-900 text-transparent font-extrabold shrink-0">
          #
        </div>

        {/* Cover Skeleton */}
        <div className="relative h-40 w-full sm:h-32 sm:w-32 shrink-0">
          <div className="absolute inset-0 bg-gray-300/30 dark:bg-neutral-800 rounded-none sm:rounded-none"></div>

          {/* Trending + Crown placeholders */}
          <div className="absolute top-2 left-2 w-14 h-5 bg-gray-300/40 dark:bg-neutral-700 rounded-full"></div>
          <div className="absolute top-2 right-2 w-5 h-5 bg-gray-300/40 dark:bg-neutral-700 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between flex-1 p-3 sm:p-4">
          {/* Title and Artist */}
          <div className="space-y-2">
            <div className="h-4 w-3/4 bg-gray-300/40 dark:bg-neutral-700 rounded"></div>
            <div className="h-3 w-1/2 bg-gray-300/30 dark:bg-neutral-800 rounded"></div>
          </div>

          {/* Chart Stats */}
          <div className="flex justify-between mt-3 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
            <div className="h-3 w-14 bg-gray-300/30 dark:bg-neutral-700 rounded"></div>
            <div className="h-3 w-12 bg-gray-300/30 dark:bg-neutral-700 rounded"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
