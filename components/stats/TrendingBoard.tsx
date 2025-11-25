"use client";

import Image from "next/image";

export interface TrendingItem {
  id: string;
  title: string;
  artist?: string;
  cover?: string;
  rank: number;
  score?: number;
}

export function TrendingBoard({ list }: { list: TrendingItem[] }) {
  return (
    <section className="rounded-2xl bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white px-1 py-4 shadow-lg transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold">Global Trends</h3>
        <div className="text-xs opacity-90">Updated weekly</div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {list.slice(0, 6).map((t) => (
          <div
            key={t.id}
            className="bg-white/10 dark:bg-white/20 rounded-xl p-3 flex items-center gap-3 transition-colors"
          >
            <div className="w-12 h-12 relative flex-shrink-0">
              {t.cover ? (
                <Image src={t.cover} fill className="object-cover rounded-md" alt={t.title} />
              ) : (
                <div className="bg-white/20 dark:bg-black/20 w-full h-full rounded-md flex items-center justify-center text-sm">
                  {t.rank}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="capitalize text-sm font-semibold truncate text-black dark:text-white">
                {t.title}
              </div>
              <div className="text-xs opacity-90 text-gray-700 dark:text-gray-300">
                {t.artist ?? "Various"}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-bold text-black dark:text-white">#{t.rank}</div>
              <div className="text-xs opacity-90 text-gray-700 dark:text-gray-300">
                {t.score ? t.score.toFixed(0) : "—"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
