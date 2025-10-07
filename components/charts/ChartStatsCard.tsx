"use client";

import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, LineChart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartStatsCardProps {
  title?: string;
  data: {
    trendingPosition?: number | null;
    chartPosition?: number | null;
    peak?: number | null;
    plays?: number | null;
    likes?: number | null;
    shares?: number | null;
    downloads?: number | null;
  };
  className?: string;
}

/**
 * 🎵 ChartStatsCard — reusable UI component for displaying chart metrics
 */
export default function ChartStatsCard({ title = "Chart & Stats", data, className }: ChartStatsCardProps) {
  const items = [
    { label: "Trending Position", value: data.trendingPosition ?? "—", icon: TrendingUp },
    { label: "Chart This Week", value: data.chartPosition ?? "—", icon: LineChart },
    { label: "Peak", value: data.peak ?? "—", icon: Star },
  ];

  const secondaryStats = [
    { label: "Plays", value: data.plays },
    { label: "Likes", value: data.likes },
    { label: "Shares", value: data.shares },
    { label: "Downloads", value: data.downloads },
  ].filter((i) => i.value !== undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "w-full py-4 rounded-2xl bg-white/80 dark:bg-neutral-900/80 border border-black/5 dark:border-white/10 shadow-sm backdrop-blur-sm",
        "hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
        {items.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2 last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>{label}</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
          </div>
        ))}

        {secondaryStats.length > 0 && (
          <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {secondaryStats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center bg-gray-50 dark:bg-neutral-800/40 rounded-lg p-2"
              >
                <span className="font-semibold text-gray-900 dark:text-gray-100">{s.value ?? "—"}</span>
                <span className="text-gray-500 dark:text-gray-400">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </motion.div>
  );
}
