"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Download, DownloadCloud, DownloadIcon, Play, PlayIcon } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";

interface TopPlaylistProps {
  id: string;
  title: string;
  curator: string;
  image: string;
  plays: number;
}

export function TopPlaylist({ id, title, curator, image, plays }: TopPlaylistProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="min-w-[240px] cursor-pointer"
    >
      <Link href={`/playlists/${id}`}>
      <div className="flex flex-row overflow-hidden bg-white rounded-l-2xl transition">
        {/* image */}
        <div className="relative h-24 w-34">
        <Image
            src={image}
            alt={curator}
            fill
            className="object-cover"
        />
        </div>
        {/* Content */}
        <div className="flex flex-col justify-between w-full p-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-600 font-medium truncate mb-1">
              {curator}
            </p>
            <h4 className="text-base md:text-lg font-extrabold text-gray-900 leading-snug truncate">
              {title}
            </h4>
          </div>
          <div className="w-full flex justify-between items-center mt-2">
            <p className="flex items-center gap-2 text-[11px] text-gray-500 tracking-tight">
              {plays} <PlayIcon size={12}/>
            </p>
          </div>
        </div>
      </div>
      </Link>
    </motion.div>
  );
}
