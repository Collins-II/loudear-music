"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image, { ImageLoaderProps } from "next/image";
import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { io } from "socket.io-client";

interface ChartRowProps {
  idx: number;
  title: string;
  artist: string;
  cover: string;
  href: string;
  thisWeek?: number | null;
  lastWeek?: number | null;
}

const customImageLoader = ({ src, width, quality }: ImageLoaderProps) => {
  try {
    const url = new URL(src);
    if (url.hostname.includes("res.cloudinary.com")) {
      return `${src}?w=${width}&q=${quality || 80}&f=auto`;
    }
    return src;
  } catch {
    return src;
  }
};

const Shimmer = () => (
  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-2xl" />
);

export function ChartRow({
  idx,
  title,
  artist,
  href,
  cover,
  thisWeek,
  lastWeek,
}: ChartRowProps) {
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [currentPos, setCurrentPos] = useState(thisWeek ?? idx + 1);
  const [prevPos, setPrevPos] = useState(lastWeek ?? null);

  // --- Socket connection for live updates ---
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string);

    socket.on("charts:update:item", (update: { id: string; newPos: number }) => {
      if (update.id === href) {
        setPrevPos(currentPos); // store previous
        setCurrentPos(update.newPos); // update live
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentPos, href]);

  // Movement calculation
  let movement: "up" | "down" | "same" | "new" = "same";
  if (prevPos == null) {
    movement = "new";
  } else if (currentPos < prevPos) {
    movement = "up";
  } else if (currentPos > prevPos) {
    movement = "down";
  } else {
    movement = "same";
  }

  return (
    <motion.a
      key={idx}
      href={href}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: idx * 0.05 }}
      className="flex items-center gap-4 py-4"
    >
      {/* Position + arrow movement */}
      <div className="flex flex-col items-center w-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPos}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-3xl font-extrabold text-black"
          >
            {currentPos}
          </motion.div>
        </AnimatePresence>

        <div className="text-xs flex items-center gap-1">
          {movement === "up" && (
            <motion.span
              key="up"
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center text-green-600 font-semibold"
            >
              <ArrowUp size={14} /> Up
            </motion.span>
          )}
          {movement === "down" && (
            <motion.span
              key="down"
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center text-red-600 font-semibold"
            >
              <ArrowDown size={14} /> Down
            </motion.span>
          )}
          {movement === "same" && (
            <span className="flex items-center text-gray-500 font-medium">
              <Minus size={14} /> Same
            </span>
          )}
          {movement === "new" && (
            <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] rounded-full font-bold">
              NEW
            </span>
          )}
        </div>
      </div>

      {/* Cover */}
      <div className="relative h-24 w-24 shrink-0">
        {loading && <Shimmer />}
        <Image
          src={!imgError && cover ? cover : "/assets/images/placeholder_cover.jpg"}
          alt={title}
          loader={customImageLoader}
          fill
          className={`object-cover rounded-r-2xl transition-opacity duration-500 ${
            loading ? "opacity-0" : "opacity-100"
          }`}
          onError={() => {
            setImgError(true);
            setLoading(false);
          }}
          onLoad={() => setLoading(false)}
        />
      </div>

      {/* Info */}
      <div className="flex-1 overflow-hidden">
        <p className="text-black font-bold truncate">{title}</p>
        <p className="text-sm text-gray-600 truncate">{artist}</p>
      </div>

      {/* Last week */}
      <div className="text-sm text-gray-500 whitespace-nowrap">
        Last week: {prevPos ?? "-"}
      </div>
    </motion.a>
  );
}
