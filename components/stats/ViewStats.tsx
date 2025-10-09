"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { calculateViewGrowth, formatViews } from "@/lib/utils";

interface ViewStatsProps {
  current: number;
  previous: number;
}

export default function ViewStats({ current, previous }: ViewStatsProps) {
  const { growthPercent, trendLabel, isTrendingUp } = calculateViewGrowth(current, previous);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group italic relative w-fit flex flex-row gap-4 items-center dark:border-neutral-800 bg-white dark:bg-black p-4 transition-all"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-neutral-900 dark:text-white tracking-tight">
          {formatViews(current)}{" "}
          <span className="text-sm text-neutral-500 dark:text-neutral-400 font-normal">views</span>
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className={`flex items-center gap-1 text-sm font-medium ${
          isTrendingUp ? "text-green-500" : "text-red-500"
        }`}
      >
        {isTrendingUp ? (
          <ArrowUpRight className="w-4 h-4" />
        ) : (
          <ArrowDownRight className="w-4 h-4" />
        )}
        <span>
          {trendLabel} ({growthPercent > 0 ? "+" : ""}
          {growthPercent}%)
        </span>
      </motion.div>

      {/* Subtle animated underline accent */}
      <motion.div
        layoutId="underline"
        className={`absolute bottom-0 left-0 h-[2px] w-full rounded-full transition-colors ${
          isTrendingUp ? "bg-green-500/40" : "bg-red-500/40"
        }`}
      />
    </motion.div>
  );
}
