"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Download, DownloadCloud, DownloadIcon, Play } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";

interface TopVideoProps {
  id: number;
  title: string;
  artist: string;
  thumbnail: string;
  genre: string;
  downloads: number;
}

export function TopVideo({ id, title, artist, thumbnail, downloads, genre }: TopVideoProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="min-w-[240px] cursor-pointer"
    >
      <Link href={`/video/${id}`}>
      <div className="flex flex-row overflow-hidden bg-white rounded-l-2xl transition">
        {/* thumbnail */}
        <div className="relative h-24 w-34">
        <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover"
        />
        <div className="absolute bottom-0 left-0 bg-green-600 text-white text-[10px] md:text-xs px-2 md:px-4 py-0.5 md:py-1 shadow-lg whitespace-nowrap">
            <h3 className="text-white text-1xl font-extrabold tracking-tight">
             {genre}
            </h3>
        </div>
        </div>
        {/* Content */}
        <div className="flex flex-col justify-between w-full p-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-600 font-medium truncate mb-1">
              {artist}
            </p>
            <h4 className="text-base md:text-lg font-extrabold text-gray-900 leading-snug truncate">
              {title}
            </h4>
          </div>
          <div className="w-full flex justify-between items-center mt-2">
            <p className="flex items-center gap-2 text-[11px] text-gray-500 tracking-tight">
              {downloads} <DownloadCloud size={12}/>
            </p>
          </div>
        </div>
      </div>
      </Link>
    </motion.div>
  );
}
