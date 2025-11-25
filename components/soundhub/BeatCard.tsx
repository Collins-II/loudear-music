"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Play, Pause, Music2, ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { addItem } from "@/lib/store/cartSlice";
import { useConvertPrice } from "@/lib/store/currency-utils";
import { getCurrencySymbol, formatNumberWithCommas } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BeatItem {
  id: string;
  title: string;
  producer: string;
  image?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  price?: number;
  previewUrl?: string;
}

interface Props {
  item: BeatItem;
}

export default function BeatCard({ item }: Props) {
  const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);
  const convertPrice = useConvertPrice();
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(false);

  const isInCart = cartItems.some(
    (c) => c.beatId === item.id && c.licenseId === "default"
  );

useEffect(() => {
  const audio = audioRef.current; // capture stable reference

  return () => {
    if (audio) audio.pause();
  };
}, []); // safe: no dependencies needed


  /* 🎧 TRACK PROGRESS BAR */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (!audio.duration) return;
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  },[isPlaying]);

  const hoverPlayButton = useMemo(
    () => (
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 flex items-center justify-center bg-black/30 dark:bg-white/10 backdrop-blur-sm"
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
      >
        <div className="p-3 bg-white dark:bg-neutral-900 rounded-full shadow-md border border-black/20 dark:border-white/20">
          {isPlaying ? (
            <Pause className="h-6 w-6 text-black dark:text-white" />
          ) : (
            <Play className="h-6 w-6 text-black dark:text-white" />
          )}
        </div>
      </motion.button>
    ),
    [hovered, isPlaying, togglePlay]
  );

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group w-full border-b-[4px] border-black dark:border-white bg-white dark:bg-neutral-900 shadow-sm transition hover:shadow-md overflow-hidden flex"
    >
      {/* Thumbnail Section */}
      <div className="relative w-36 sm:w-40 h-36 sm:h-40 shrink-0 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
        <Image
          src={item.image || "/placeholder.png"}
          alt={item.title}
          fill
          className="object-cover"
        />

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20 dark:bg-white/20">
          <motion.div
            className="h-full bg-black dark:bg-white"
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>

        {/* Hover Play Button */}
        {hovered && hoverPlayButton}

        {item.previewUrl && <audio ref={audioRef} src={item.previewUrl} />}
      </div>

      {/* Information Section */}
      <div className="flex flex-col justify-between flex-1 p-4">
        <div>
          <div className="text-xs uppercase tracking-widest font-medium text-black/60 dark:text-white/60">
            {item.genre}
          </div>

          <h3 className="mt-1 text-lg sm:text-xl font-bold text-black dark:text-white leading-tight">
            {item.title}
          </h3>

          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            {item.producer}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-3 mt-3 text-sm text-black/70 dark:text-white/70">
          {item.bpm && (
            <div className="flex items-center gap-1">
              <Music2 className="w-4 h-4" />
              <span>{item.bpm} BPM</span>
            </div>
          )}
          {item.key && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Key:</span>
              <span>{item.key}</span>
            </div>
          )}
        </div>

        {/* Bottom Row */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xl font-bold text-black dark:text-white">
            {item.price
              ? `${getCurrencySymbol(selectedCurrency)}${formatNumberWithCommas(
                  convertPrice(Number(item.price))
                )}`
              : "Free"}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={togglePlay}
              className="border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button
              size="icon"
              onClick={() =>
                dispatch(
                  addItem({
                    title: item.title,
                    image: item.image as string,
                    beatId: item.id,
                    licenseId: "default",
                    price: item.price || 0
                  })
                )
              }
              disabled={isInCart}
              className={`${
                isInCart
                  ? "bg-neutral-400 dark:bg-neutral-700 text-white"
                  : "bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
              } rounded-md`}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
