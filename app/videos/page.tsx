"use client";

import React, { useState, useEffect } from "react";
import IndexVideo from "./components/IndexVideo";
import { getCharts, ChartItem } from "@/actions/getCharts";
import TopCardSkeleton from "@/components/skeletons/top-card-skeleton";
import SkeletonList from "@/components/skeletons/skeleton-list";
import VideoCardSkeleton from "@/components/skeletons/video-card-skeleton";

export default function VideoPage() {
  const [videos, setVideos] = useState<ChartItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const data = await getCharts({
          category: "videos",
          region: "global",
          sort: "all-time",
          limit: 200,
        });
        setVideos(data);
      } catch (err) {
        console.error("Failed to fetch videos:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  if (loading || !videos) {
    return (
      <main className="bg-background min-h-screen px-6 md:px-12 py-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Main Grid Skeleton */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
          <SkeletonList count={5} />
        </div>

        {/* Sidebar Skeleton */}
        <aside className="space-y-12">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <TopCardSkeleton key={i} />
            ))}
          </div>

          <div className="bg-gray-200 h-60 flex items-center justify-center rounded-lg">
            <span className="text-gray-500">Advertisement</span>
          </div>
        </aside>
      </main>
    );
  }

  return <IndexVideo videos={videos} />;
}
