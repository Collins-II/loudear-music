"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface Item {
  id: string;
  title: string;
  artist?: string;
  type: string;
  image?: string;
  genre?: string;
  releaseDate?: string;
  href?: string;
  extra?: { previewUrl?: string };
  stats?: { views?: number };
}

interface Props {
  item: Item;
  rank?: number;
  playingPreview?: boolean;
}

export default function SearchCard({ item, rank }: Props) {

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="group flex items-center gap-4 bg-white/10 dark:bg-neutral-900/80 rounded-xl p-3 hover:bg-white/20 dark:hover:bg-neutral-800/80 transition shadow-sm hover:shadow-md"
    >
      {/* Cover */}
      <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-gray-300/20 flex items-center justify-center text-gray-500 text-sm font-semibold">
            {rank ?? "—"}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="capitalize text-sm font-semibold truncate text-white">
              {item.title}
            </div>
            <div className="text-xs text-gray-300 truncate">
              {item.artist}
            </div>
          </div>
          {rank && (
            <div className="text-sm font-bold text-gray-400">#{rank}</div>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
          <div className="flex items-center gap-2 truncate">
            {item.genre && (
              <span className="bg-white/10 px-2 py-0.5 rounded-full text-[11px]">
                {item.genre}
              </span>
            )}
            {item.type && (
              <span className="uppercase bg-white/90 text-black font-bold px-2 py-0.5 rounded-full text-[11px]">{item.type}</span>
            )}
            {item.releaseDate && (
              <span>{new Date(item.releaseDate).getFullYear()}</span>
            )}
          </div>
          {item.href && (
            <a
              href={item.href}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition"
            >
              Open <ArrowRight size={12} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
