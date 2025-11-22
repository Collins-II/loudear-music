"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Play, Pause, Info } from "lucide-react";
import { FaPlus } from "react-icons/fa6";
import { GiCheckMark } from "react-icons/gi";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { addItem } from "@/lib/store/cartSlice";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { IoIosClose } from "react-icons/io";
import { Separator } from "../ui/separator";
import { useConvertPrice } from "@/lib/store/currency-utils";
import { getCurrencySymbol, formatNumberWithCommas } from "@/lib/utils";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const modalAudio = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const inCart = cartItems.some(
    (c) => c.beatId === item.id && c.licenseId === "default"
  );

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleModalPlay = () => {
    if (!modalAudio.current) return;
    if (!open) return;

    if (!modalAudio.current.paused) {
      modalAudio.current.pause();
      setIsPlaying(false);
    } else {
      modalAudio.current.play();
      setIsPlaying(true);
    }
  };

  const handleAddToCart = () => {
    dispatch(
      addItem({
        title: item.title,
        image: item.image as string,
        beatId: item.id,
        licenseId: "default",
        price: item.price || 0
      })
    );
  };

  return (
    <>
      {/* ---- CARD ---- */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="
          group relative flex items-start gap-3 sm:gap-4 
          rounded-xl p-3 sm:p-4 border border-black/10 dark:border-white/10 
          shadow-md hover:shadow-lg hover:scale-[1.01] 
          bg-white dark:bg-black transition-transform
        "
      >
        {/* Cover */}
        <button
          onClick={() => setOpen(true)}
          className="
            relative w-16 h-16 sm:w-20 sm:h-20 
            flex-shrink-0 rounded-xl overflow-hidden 
            border-2 border-black/20 dark:border-white/20 
            group-hover:border-indigo-500 transition
          "
        >
          {item.image ? (
            <Image src={item.image} alt={item.title} fill className="object-cover" />
          ) : (
            <div className="bg-gray-200 dark:bg-neutral-800 w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-semibold text-sm">
              Beat
            </div>
          )}

          {/* Waveform */}
          {isPlaying && (
            <motion.div
              className="absolute bottom-1 left-1 right-1 flex items-end justify-between px-1 h-5 sm:h-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[4, 8, 12, 8, 4].map((h, i) => (
                <motion.span
                  key={i}
                  className="w-[2px] sm:w-1 bg-indigo-400 dark:bg-indigo-300 rounded"
                  animate={{ height: ["4px", `${h}px`, "4px"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
          )}
        </button>

        {item.previewUrl && (
          <audio
            ref={audioRef}
            src={item.previewUrl}
            onEnded={() => setIsPlaying(false)}
          />
        )}

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-sm sm:text-base font-bold truncate text-black dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition">
                {item.title}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                By{" "}
                <span className="italic font-semibold text-black dark:text-white">
                  {item.producer}
                </span>
              </div>
            </div>

            
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {item.genre && (
              <span className="tag-indigo">{item.genre}</span>
            )}
            {item.bpm && (
              <span className="tag-green">{item.bpm} BPM</span>
            )}
            {item.key && (
              <span className="tag-purple">Key {item.key}</span>
            )}
          </div>

          {/* Price + Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-2">
            <span className="text-black dark:text-white font-bold text-sm sm:text-base">
             {item.price
                ? `${getCurrencySymbol(selectedCurrency)} ${formatNumberWithCommas(convertPrice(Number(item.price)))}`
                : "Free"}
              </span>
            
          <div className="flex items-center gap-1">
            {/* Play Button */}
            {item.previewUrl && (
              <button
                onClick={togglePlay}
                className="
                  w-8 h-8 sm:w-9 sm:h-9 rounded-full 
                  bg-indigo-500 hover:bg-indigo-600 
                  text-white flex items-center justify-center 
                  shadow-md transition
                "
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
            )}
            <button
              onClick={handleAddToCart}
              disabled={inCart}
              className={`btn-cart ${inCart ? "btn-disabled" : "btn-indigo"}`}
            >
              {inCart ? <GiCheckMark size={14} />: <FaPlus size={14} />}  {inCart ? "In Cart" : "Full Beat"}
            </button>
            
            </div>
          </div>
        </div>

        {/* Details Icon */}
        <button
          aria-label="info-button"
          onClick={() => setOpen(true)}
          className="absolute top-2 right-2 text-neutral-400 opacity-60 hover:opacity-100 transition"
        >
          <Info size={18} />
        </button>
      </motion.div>

      {/* ---- MODAL ---- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md sm:max-w-lg md:rounded-2xl p-6 bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10">
        <div className="flex items-center justify-between">
        <h3 className="font-semibold text-md italic text-gray-900 dark:text-white">Beat Info</h3>
         <button
            aria-label="close-button"
            onClick={() => setOpen(false)}
            className={`relative p-2 rounded-full transition text-black/90`}
           >
             <IoIosClose size={30}/>
          </button>
        </div>
        <Separator className=""/>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{item.title}</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Produced by <span className="font-semibold">{item.producer}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {/* Big Cover */}
            <div className="relative w-full h-52 rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
              {item.image ? (
                <Image src={item.image} alt={item.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-neutral-800" />
              )}
            </div>

            {/* Modal Audio */}
            {item.previewUrl && (
              <div className="flex items-center justify-center mt-4">
                <audio ref={modalAudio} src={item.previewUrl} />
                <button
                  aria-label="info-play"
                  onClick={toggleModalPlay}
                  className="w-12 h-12 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center shadow-lg transition"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
              </div>
            )}

            {/* Details */}
            <div className="mt-4 flex flex-wrap gap-2">
              {item.genre && <span className="tag-indigo">{item.genre}</span>}
              {item.bpm && <span className="tag-green">{item.bpm} BPM</span>}
              {item.key && <span className="tag-purple">Key {item.key}</span>}
            </div>

            {/* Price + CTA */}
            <div className="mt-6 flex items-center justify-between">
              <span className="font-bold text-lg text-black dark:text-white">
              {item.price
                ? `${getCurrencySymbol(selectedCurrency)} ${formatNumberWithCommas(convertPrice(Number(item.price)))}`
                : "Free"}
              </span>
              <button
                onClick={handleAddToCart}
                disabled={inCart}
                className={`btn-cart text-sm px-4 py-2 ${
                  inCart ? "btn-disabled" : "btn-indigo"
                }`}
              >
                {inCart ? <GiCheckMark size={14} />: <FaPlus size={14} />}  {inCart ? "In Cart" : "Get Full Beat"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
