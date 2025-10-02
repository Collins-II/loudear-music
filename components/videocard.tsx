import { Video } from "@/data/types";
import { timeAgo } from "@/lib/utils";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import Image from "next/image";

export default function VideoSectionCard({ video }: { video: Video }) {
  return (
    <motion.div
      key={video.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.4 }}
      className="bg-zinc-900/70 backdrop-blur-xl overflow-hidden 
                 shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/10 
                 hover:border-indigo-400/40 hover:shadow-indigo-500/20 
                 transition-all duration-300 flex flex-row"
    >
      {/* Image */}
      <div className="relative w-1/3 h-56 overflow-hidden">
        <Image
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
          fill
       />
      </div>

      {/* Content */}
      <div className="w-2/3 p-5 flex flex-col gap-3">
        
        <span className="self-start px-3 py-1 rounded-full text-xs font-semibold 
                        bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
          {video.category}
        </span>

        {/* Title */}
        <h3 className="text-white font-semibold text-lg leading-snug line-clamp-2 
                       hover:text-indigo-400 transition-colors">
          {video.title}
        </h3>

        {/* Date */}
        <div className="flex items-center gap-2 text-white/70 text-xs">
          <Calendar size={14} className="text-indigo-400" />
          {timeAgo(video?.publishedAt as string)}
        </div>
      </div>
    </motion.div>
  );
}
