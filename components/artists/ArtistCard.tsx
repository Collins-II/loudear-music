"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Download, DownloadCloud, DownloadIcon, Group, GroupIcon, Play, UserPlus2Icon } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";

interface ArtistCardProps {
  id: number;
  name: string;
  image: string;
  topSongs: string[];
  totalSongs: number;
  followers: number;
  region: string;
}

export function ArtistCard({ id, name, topSongs, totalSongs, image, followers, region }: ArtistCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="min-w-[240px] cursor-pointer"
    >
      <div className="flex flex-row overflow-hidden bg-white rounded-l-2xl transition">
        {/* image */}
        <div className="relative h-24 w-24 shrink-0">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover "
            priority
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300">
            <Play className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
        </div>

        {/* Content */}
        <CardContent className="flex flex-col justify-between w-full p-3">
          <div>
            <p className="flex italic gap-2 items-center text-[14px] tracking-wide text-slate-600 font-medium truncate mb-1">
              {followers.toLocaleString()} followers
            </p>
            <h4 className="text-base md:text-lg font-extrabold text-gray-900 leading-snug truncate">
              {name}
            </h4>
          </div>
          <div className="w-full flex justify-between items-center mt-2">
            <p className="flex items-center gap-2 text-[11px] text-gray-500 tracking-tight">
              {totalSongs} songs
            </p>
            <Link href={`/artist`} className="text-[16px] italic text-blue-800">
              view
            </Link>
          </div>
        </CardContent>
      </div>
    </motion.div>
  );
}
