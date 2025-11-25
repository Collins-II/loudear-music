"use client";

import { motion } from "framer-motion";
import { Heart, DownloadCloud } from "lucide-react";
import { useConvertPrice } from "@/lib/store/currency-utils";
import { getCurrencySymbol, formatNumberWithCommas } from "@/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

export default function InteractiveButtons({
  liked,
  downloading,
  price,
  handleInteraction,
  handleDownload,
}: {
  liked: boolean;
  downloading: boolean;
  price?: number;
  handleInteraction: (type: string) => void;
  handleDownload: () => void;
}) {
  const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);
  const convertPrice = useConvertPrice();
  return (
    <div className="italic flex flex-wrap items-center gap-3">
      <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => handleInteraction("like")}
      className={`relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full border font-medium overflow-hidden transition-all duration-300
        ${
          liked
            ? "bg-gradient-to-r from-pink-50 via-red-100 to-pink-50 border-pink-300 text-red-600"
            : "bg-gray-100 dark:bg-neutral-800 border-black/10 dark:border-white/10 text-black dark:text-gray-200 hover:bg-black hover:text-white"
        }`}
    >
      {/* Subtle gradient ripple overlay */}
      <motion.span
        key={liked ? "liked" : "unliked"}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: liked ? 0.15 : 0, scale: liked ? 1.4 : 1 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400/30 to-pink-400/30 pointer-events-none"
      />

      {/* Icon with bounce effect */}
      <motion.div
        animate={{
          rotate: liked ? [0, -15, 15, 0] : 0,
          scale: liked ? [1, 1.3, 1] : 1,
        }}
        transition={{ duration: 0.35 }}
        className="relative z-10"
      >
        <Heart
          className={`w-4 h-4 transition-colors duration-300 ${
            liked ? "fill-red-500 text-red-500" : "text-gray-500 group-hover:text-white"
          }`}
        />
      </motion.div>

      {/* Text label */}
      <motion.span
        key={liked ? "liked-label" : "like-label"}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 text-sm font-medium"
      >
        {liked ? "Liked" : "Like"}
      </motion.span>
    </motion.button>

      {/* Download Button */}
      <motion.button
        whileHover={{
          scale: 1.08,
          boxShadow: "0 0 15px rgba(0,0,0,0.15)",
        }}
        whileTap={{ scale: 0.9 }}
        onClick={handleDownload}
        className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 bg-white dark:bg-neutral-900 text-black dark:text-gray-200 transition-all duration-300 overflow-hidden group"
      >
        {/* Shine effect */}
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-out" />

        <motion.div
          animate={{
            y: downloading ? [0, -5, 0] : 0,
            opacity: downloading ? [1, 0.7, 1] : 1,
          }}
          transition={{ duration: 1, repeat: downloading ? Infinity : 0 }}
        >
          <DownloadCloud className="w-4 h-4" />
        </motion.div>

        <span className="text-sm font-medium">
          {downloading ? "Downloading..." : `Download ${price
                          ? `${getCurrencySymbol(selectedCurrency)}${formatNumberWithCommas(convertPrice(Number(price)))}`
                          : "Free"}`
          }
        </span>
      </motion.button>
    </div>
  );
}
