import { motion } from "framer-motion";

export default function SkeletonSearch() {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="flex items-center gap-4 bg-white/10 dark:bg-neutral-900/80 rounded-xl p-3 shadow-sm animate-pulse"
    >
      {/* Cover Skeleton */}
      <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden">
        <div className="w-full h-full bg-gray-300/20 dark:bg-neutral-700 rounded-lg"></div>
      </div>

      {/* Info Skeleton */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Title + Rank row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="h-3.5 bg-gray-300/30 dark:bg-neutral-700 rounded w-3/4"></div>
            <div className="h-2.5 bg-gray-300/20 dark:bg-neutral-800 rounded w-1/2"></div>
          </div>
          <div className="w-6 h-3 bg-gray-300/30 dark:bg-neutral-700 rounded"></div>
        </div>

        {/* Tags / Metadata */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-10 bg-gray-300/20 dark:bg-neutral-800 rounded-full"></div>
            <div className="h-3 w-8 bg-gray-300/20 dark:bg-neutral-800 rounded-full"></div>
            <div className="h-3 w-6 bg-gray-300/20 dark:bg-neutral-800 rounded-full"></div>
          </div>
          <div className="h-3 w-10 bg-gray-300/20 dark:bg-neutral-800 rounded"></div>
        </div>
      </div>
    </motion.div>
  );
}
