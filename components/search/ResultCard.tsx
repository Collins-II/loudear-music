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
  artist?: string;
  thumbnail: string;
  type: string;
}

export function ResultCard({ id, title, artist, thumbnail, type }: TopVideoProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="min-w-[240px] cursor-pointer"
    >
      <Link href={`/video/${id}`}>
      <div className="flex flex-row overflow-hidden bg-white rounded-l-2xl transition">
        {/* thumbnail */}
        <div className="relative h-16 w-34">
        <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover"
        />
        <div className="absolute bottom-0 left-0 bg-green-600 text-white text-[10px] md:text-xs px-2 md:px-4 py-0.5 md:py-1 shadow-lg whitespace-nowrap">
            <h3 className="text-white text-1xl font-extrabold tracking-tight">
             {type}
            </h3>
        </div>
        </div>
        {/* Content */}
        <div className="flex-wrap flex-row gap-4 justify-between items-center w-full p-3">
            {type !== "Blog" && (
            <p className="text-base md:text-lg uppercase tracking-wide text-slate-600 font-medium truncate mb-1">
              {artist}
            </p>
            )}
            {type !== "Artist" && (
               <h4 className=" text-lg font-extrabold text-gray-900 leading-snug truncate">
              {title}
            </h4>
            )}
           
        </div>
      </div>
      </Link>
    </motion.div>
  );
}
