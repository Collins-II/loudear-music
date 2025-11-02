"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { PlayIcon } from "lucide-react";
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
      className="w-full sm:w-[280px] md:w-[320px] lg:w-[350px] cursor-pointer"
    >
      <Link href={`/playlists/${id}`}>
        <div className="flex bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
          {/* Image */}
          <div className="relative flex-shrink-0 w-24 h-24">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 6rem, (max-width: 768px) 7rem, (max-width: 1024px) 8rem, 9rem"
              priority
            />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-between p-3 w-full">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-wide text-slate-600 font-medium truncate">
                {curator}
              </p>
              <h4 className=" sm:text-base md:text-lg font-extrabold text-gray-900 leading-snug truncate">
                {title}
              </h4>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="flex items-center gap-1 text-xs sm:text-[11px] text-gray-500 tracking-tight">
                {plays} <PlayIcon size={14} />
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
