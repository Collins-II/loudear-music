"use client";

import { motion } from "framer-motion";
import { CardContent } from "@/components/ui/card";

export default function TopCardSkeleton() {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="w-full cursor-pointer"
    >
      <div className="flex flex-col overflow-hidden bg-white rounded-tl-2xl hover:shadow-lg transition relative animate-pulse">
        {/* Thumbnail Skeleton */}
        <div className="relative w-full h-48 sm:h-28 flex-shrink-0">
          <div className="absolute inset-0 bg-gray-300/30 dark:bg-neutral-800 rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none"></div>

          {/* Position Badge */}
          <div className="absolute top-2 left-2 w-10 h-5 bg-gray-300/40 dark:bg-neutral-700 rounded-md"></div>

          {/* Genre Badge */}
          <div className="absolute bottom-0 left-0 w-16 h-5 bg-gray-300/40 dark:bg-neutral-700 rounded-tr-md sm:rounded-tr-none sm:rounded-tl-none sm:rounded-bl-none"></div>

          {/* Center Play Button Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-gray-300/40 dark:bg-neutral-700 rounded-full"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <CardContent className="flex flex-col justify-between px-1 py-3 w-full space-y-2">
          <div className="overflow-hidden pr-2 space-y-1">
            <div className="h-2.5 w-1/3 bg-gray-300/30 dark:bg-neutral-800 rounded"></div>
            <div className="h-4 w-2/3 bg-gray-300/40 dark:bg-neutral-700 rounded"></div>
          </div>

          <div className="flex justify-between items-center mt-1">
            <div className="h-2.5 w-1/4 bg-gray-300/30 dark:bg-neutral-800 rounded"></div>
          </div>
        </CardContent>
      </div>
    </motion.div>
  );
}
