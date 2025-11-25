"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MusicCard } from "./music/MusicCard";
import { VideoCard } from "./video/VideoCard";
import { VideoModal } from "@/components/video/VideoModal";
import HorizontalSlider from "./sliders/HorizontalSlider";
//import GoogleAd from "./ads/AdSlot";
import { ChartItem } from "@/actions/getCharts";
import MusicCardSkeleton from "./skeletons/music-card-skeleton";
import VideoCardSkeleton from "./skeletons/video-card-skeleton";
import ThemedHeading from "./themed-heading";

interface SectionProps {
  songs?: ChartItem[];
  videos?: ChartItem[];
  loading?: boolean;
}

export default function LatestSection({ songs, videos, loading }: SectionProps) {
  const [open, setOpen] = useState(false);
  const [selectedVideo] = useState<string | null>(null);

  const isLoading = loading || (!songs?.length && !videos?.length);

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Trending Music */}
            <div className="px-6 md:px-0">
              <ThemedHeading>
                Trending Music
              </ThemedHeading>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-4 scrollbar-hide">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => <MusicCardSkeleton key={i} />)
                  : songs?.map((track, idx) => (
                      <MusicCard
                        key={idx}
                        id={track.id}
                        title={track.title}
                        artist={track.artist as string}
                        href={`/music/song/${track.id}`}
                        cover={track.image}
                        downloads={track.stats.downloads}
                        views={track.stats.totalViews}
                        genre={track.genre as string}
                        publishedAt={track.releaseDate as string}
                      />
                    ))}
              </div>

              <div className="flex items-center justify-end my-6 mr-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/music">
                    <div className="relative flex items-center gap-2 text-md capitalize font-bold text-black tracking-wide w-fit">
                      <span className="relative z-10 pb-1 capitalize">See More</span>
                      <span className="absolute left-0 bottom-0 w-full h-[2px] bg-black"></span>
                    </div>
                  </Link>
                </motion.div>
              </div>
            </div>
          <div className="bg-gray-200 h-60 flex items-center justify-center rounded-lg">
            <span className="text-gray-500">Advertisement</span>
          </div>
            {/* Banner Ad 
            <GoogleAd slot="1234567890" />*/}

            {/* Top Videos */}
            {videos && (
            <div>
              <HorizontalSlider title="Top Videos">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => <VideoCardSkeleton key={i} />)
                  : videos?.map((video) => (
                      <VideoCard
                        key={video.id}
                        id={video.id}
                        title={video.title}
                        artist={video.artist as string}
                        cover={video.image}
                        downloads={video.stats.downloads}
                        category={video.genre}
                        views={video.stats.totalViews}
                        videoUrl={video.videoUrl as string}
                      />
                    ))}
              </HorizontalSlider>

              <div className="flex items-center justify-end my-6 mr-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/videos">
                    <div className="relative flex items-center gap-2 text-md capitalize font-bold text-black tracking-wide w-fit">
                      <span className="relative z-10 pb-1 capitalize">See More</span>
                      <span className="absolute left-0 bottom-0 w-full h-[2px] bg-black"></span>
                    </div>
                  </Link>
                </motion.div>
              </div>
            </div>
            )}
          </div>

           Sidebar Ads 
          <aside className="hidden lg:flex flex-col gap-6">
          <div className="bg-gray-200 h-20 flex items-center justify-center rounded-lg">
            <span className="text-gray-500">Advertisement</span>
          </div>
          <div className="bg-gray-200 h-60 flex items-center justify-center rounded-lg">
            <span className="text-gray-500">Advertisement</span>
          </div>
            
           {/* <GoogleAd slot="1234567890" />
            <GoogleAd slot="1234567890" />*/}
          </aside> 
        </div>

        {/* Video Modal */}
        {selectedVideo && (
          <VideoModal open={open} onOpenChange={setOpen} videoId={selectedVideo} />
        )}
      </div>
    </section>
  );
}
