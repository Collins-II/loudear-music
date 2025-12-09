"use client";

import React from "react";
import { TrendingItem } from "@/app/search/components/IndexSearch";
import Image from "next/image";
import { TrendingUp, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* ------------------------------------------------------------
   👉 Motion Loader (Shimmer Placeholder)
------------------------------------------------------------ */
function TopRecordsLoader() {
  return (
    <div className="grid grid-cols-1 gap-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          exit={{ opacity: 0 }}
          className="flex gap-4 p-3 rounded-xl bg-black/5 dark:bg-white/10 animate-pulse"
        >
          <div className="w-14 h-14 rounded-lg bg-black/10 dark:bg-white/20" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 rounded bg-black/10 dark:bg-white/20" />
            <div className="h-3 w-1/3 rounded bg-black/10 dark:bg-white/20" />
            <div className="h-3 w-1/2 rounded bg-black/10 dark:bg-white/20 mt-2" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------
   👉 Dynamic HREF Builder
------------------------------------------------------------ */
function getItemHref(item: TrendingItem) {
  const model = item.model?.toLowerCase();

  if (!model) return "#";

  switch (model) {
    case "song":
      return `/music/song/${item.id}`;
    case "album":
      return `/music/album/${item.id}`;
    case "video":
      return `/videos/${item.id}`;
    default:
      return `/${model}/${item.id}`;
  }
}

/* ------------------------------------------------------------
   Component
------------------------------------------------------------ */
export function TopRecordsBoard({
  list,
  loading = false,
}: {
  list: TrendingItem[];
  loading?: boolean;
}) {
  const showList = !loading && list.length > 0;

  return (
    <section
      className={`
        rounded-2xl md:px-4 md:pb-4 transition-colors
        bg-white text-gray-900
        dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
        dark:text-white
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Top Records</h3>

        <div className="flex items-center gap-2 text-xs opacity-80">
          Global Account Trends
          <TrendingUp className="w-4 h-4 text-gray-400 dark:text-white" />
        </div>
      </div>

      {/* Loader */}
      {loading && <TopRecordsLoader />}

      {/* List */}
      {showList && (
        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence>
            {list.slice(0, 6).map((t) => {
              const href = getItemHref(t);

              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`
                    group flex items-center gap-4 p-3 rounded-xl 
                    transition shadow-sm hover:shadow-md cursor-pointer
                    bg-black/5 hover:bg-black/10 text-gray-900
                    dark:bg-white/10 dark:hover:bg-white/20 dark:text-white/90
                  `}
                >
                  {/* Cover */}
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    {t.cover ? (
                      <Image
                        src={t.cover}
                        alt={t.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300/20 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-white/60 text-sm font-semibold">
                        {t.rank}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="capitalize text-sm font-semibold truncate">
                          {t.title}
                        </div>
                      </div>

                      <div className="text-sm font-bold text-gray-500 dark:text-gray-300">
                        #{t.rank}
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-xs mt-1 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2 truncate">
                        {t.genre && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] bg-black/10 dark:bg-white/10">
                            {t.genre}
                          </span>
                        )}

                        <span className="uppercase px-2 py-0.5 rounded-full text-[11px] bg-white text-black dark:bg-white/80 dark:text-black font-semibold">
                          {t.model}
                        </span>

                        {t.createdAt && (
                          <span>{new Date(t.createdAt).getFullYear()}</span>
                        )}
                      </div>

                      <Link
                        href={href}
                        className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-300 transition"
                      >
                        <span className="hidden sm:inline">Open</span> <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
