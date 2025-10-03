"use client";

import { MusicCard } from "./music/MusicCard";
import { VideoCard } from "./video/VideoCard";
import { VideoModal } from "@/components/video/VideoModal";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import Link from "next/link";;
import HorizontalSlider from "./sliders/HorizontalSlider";
import { ChartItem } from "@/actions/getCharts";

interface SectionProps {
  songs: ChartItem[]
  videos: ChartItem[]
}

export default function LatestSection({ songs, videos}: SectionProps) {
  const [open, setOpen] = useState(false);
  const [selectedVideo] = useState<string | null>(null);

  return (
    <section className="py-16  bg-background">
      <div className="max-w-7xl mx-auto">

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-12">
          {/* Example Ad Section 
        */}
          {/* Latest Music */}
          <div className="px-6 md:px-0 ">
            <h3 className="relative text-slate-900 text-2xl md:text-3xl font-extrabold mb-6 tracking-tight">
              <span className="relative z-10 bg-white pr-3">Latest Music</span>
              <span className="absolute left-0 top-1/2 w-full h-[8px] bg-black -z-0"></span>
           </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 overflow-x-auto pb-4 scrollbar-hide ">
              {songs?.map((track,idx) => (
                <MusicCard
                  key={idx}
                  id={track.id}
                  title={track.title}
                  artist={track.artist as string}
                  href={`/music/song/${track.id}`}
                  cover={track.image}
                  downloads={track.stats.downloads}
                  views={track.stats.views}
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

          {/* Banner Ad Space */}
        <div className="bg-blue-200 rounded-xl p-6 text-center shadow-md">
          <p className="text-gray-700 font-semibold">Ad Space</p>
          <p className="text-sm text-gray-600">Promote your brand</p>
        </div>

          {/* Latest Videos */}
          <div className="">
  {/* Responsive Layout: horizontal scroll on small, grid on md+ */}
            <HorizontalSlider title="Latest Videos" >
                {videos?.map((video) => (
                  <VideoCard
                    key={video.id}
                    id={video.id}
                    title={video.title}
                    artist={video.artist as string}
                    cover={video.image}
                    downloads={video.stats.downloads}
                    publishedAt={video.releaseDate}
                    category={video.genre}
                    views={video.stats.views}
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
        </div>

        {/* Sidebar Ads */}
        <aside className="hidden lg:flex flex-col gap-6">
           {/* Featured Artist (FridaysPowerAct) 
                  <div className="w-full top-30 flex items-center">
                    <motion.div
                      initial={{ x: 50, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      className="flex items-center justify-center"
                    >
                      <div className="relative">
                        <Image
                          src="/assets/images/bizzy07.jpg"
                          alt="Featured Artist"
                          width={220}
                          height={220}
                          className="rounded-xl md:rounded-2xl shadow-2xl object-cover"
                          priority
                        />
                        <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 bg-primary text-white text-[10px] md:text-xs px-2 md:px-4 py-0.5 md:py-1 rounded-full shadow-lg whitespace-nowrap">
                          FridaysPowerAct
                        </div>
                      </div>
                    </motion.div>
                  </div>*/}
          <Card className="h-94 flex items-center justify-center bg-yellow-500">
            {/* Google AdSense Vertical Slot */}
            <span className="text-muted-foreground text-sm">
              [300x600 Sidebar Ad]
            </span>
          </Card>
          <Card className="h-64 flex items-center justify-center bg-green-500">
            <span className="text-muted-foreground text-sm">
              [300x250 Ad Slot]
            </span>
          </Card>
        </aside>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          open={open}
          onOpenChange={setOpen}
          videoId={selectedVideo}
        />
      )}
      </div>
    </section>
  );
}
