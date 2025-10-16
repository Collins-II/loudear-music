import React from "react";

const SkeletonSearch = () => (
  <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 shadow">
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />
    <div className="w-full h-56 md:h-48 lg:h-56 bg-gray-200 dark:bg-neutral-800" />
    <div className="p-4 space-y-3">
      <div className="h-4 w-3/4 bg-gray-200 dark:bg-neutral-800 rounded" />
      <div className="h-3 w-1/2 bg-gray-200 dark:bg-neutral-800 rounded" />
      <div className="h-3 w-full bg-gray-200 dark:bg-neutral-800 rounded" />
    </div>
  </div>
);

export default SkeletonSearch;