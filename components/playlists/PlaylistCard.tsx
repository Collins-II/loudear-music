"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { PlayCircle } from "lucide-react";
import Link from "next/link";

interface PlaylistCardProps {
  id: number | string;
  title: string;
  cover: string;
  creator: string;
  tracks: number;
  likes: number;
}

export function PlaylistCard({
  id,
  title,
  cover,
  creator,
  tracks,
}: PlaylistCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg h-64 w-full"
    >
      <Link href={`/playlists/${id}`}>
      {/* Background Cover Image */}
      <Image
        src={cover}
        alt={creator}
        fill
        priority
        className="object-cover"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Floating Play Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-4 right-4 z-20"
      >
        <PlayCircle className="w-12 h-12 text-white drop-shadow-lg hover:text-blue-400 transition-colors" />
      </motion.div>

      {/* Details displayed beautifully over image */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <h3 className="text-lg font-extrabold text-white truncate drop-shadow-md">
          {title}
        </h3>
        <p className="text-sm text-gray-200 capitalize">By {creator}</p>
        <div className="flex justify-between items-center mt-2 text-sm text-gray-300">
          <span>{tracks} songs</span>
        </div>
      </div>
      </Link>
    </motion.div>
  );
}
