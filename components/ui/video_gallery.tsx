import { YTStat } from "@/data/types";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import VideoCard from "../video_card";

const useYouTubeStats = (videoIds: string[]) => {
  const [stats, setStats] = useState<Record<string, YTStat>>({});
  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const params = new URLSearchParams();
        videoIds.forEach((id) => params.append("id", id));
        const res = await fetch(`/api/youtube?${params.toString()}`);
        if (!res.ok) throw new Error("Failed stats");
        const data: YTStat[] = await res.json();
        if (!active) return;
        const map: Record<string, YTStat> = {};
        for (const s of data) map[s.videoId] = s;
        setStats(map);
      } catch {
        // graceful fallback: empty stats
        const map: Record<string, YTStat> = {};
        for (const id of videoIds) map[id] = { videoId: id };
        setStats(map);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [videoIds.join(",")]);

  return stats;
};


function VideoGallery({ videoIds }: { videoIds: string[] }) {
  const stats = useYouTubeStats(videoIds);
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {videoIds.map((id, i) => (
        <motion.div key={id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: i * 0.05 }} viewport={{ once: true }}>
          <VideoCard videoId={id} stat={stats[id]} />
        </motion.div>
      ))}
    </div>
  );
}

export default VideoGallery;