import React from "react";

export default function SkeletonList({ count = 10 }: { count?: number }) {
  return (
    <div className="divide-y animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4">
          <div className="w-16 h-16 bg-gray-300 rounded-md"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="w-10 h-4 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}
