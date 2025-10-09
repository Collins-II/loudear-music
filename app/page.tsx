import React from "react";
import LatestSection from "@/components/LatestSection";
import HeroSection from "@/components/hero";
import { getSongs } from "@/actions/getSongs";
import { getVideos } from "@/actions/getVideos";
import BlogSection from "@/components/blog_section";
import NetworkError from "@/components/NetworkError";

export default async function Home() {
  const songs = await getSongs();
  const videos = await getVideos()

  if (!songs || !videos) {
        return <NetworkError />;
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[radial-gradient(circle_at_10%_0%,#0b0f1a_0%,#05070d_60%,#05060a_100%)] text-white">
      <HeroSection />
      
      <LatestSection songs={songs} videos={videos} />
  
      <BlogSection/>
    </div>
  );
}
