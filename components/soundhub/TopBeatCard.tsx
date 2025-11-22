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
import { BeatItem } from "@/actions/getBeats";

interface Props {
  position: number;
  item: BeatItem;
}

export default function TopBeatCard({ position, item }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const modalAudio = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const inCart = cartItems.some(
    (c) => c.beatId === item._id && c.licenseId === "default"
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
    if (!modalAudio.current || !open) return;

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
        beatId: item._id,
        licenseId: "default",
        price: item.price || 0
      })
    );
  };

  return (
    <>
      {/* ---- TOP BEAT CARD ---- */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="
          relative group rounded-2xl overflow-hidden
          border border-black/10 dark:border-white/10
          shadow-md hover:shadow-xl 
          bg-white dark:bg-neutral-900 
          transition-transform hover:scale-[1.015]
        "
      >
        {/* Top Image Section */}
        <div className="relative w-full h-40 sm:h-48">
          <button
            aria-label="open-button"
            onClick={() => setOpen(true)}
            className="absolute inset-0 z-10"
          />

          {item.image ? (
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-neutral-800" />
          )}

          {/* Waveform */}
          {isPlaying && (
            <motion.div
              className="absolute bottom-2 left-2 right-2 flex items-end justify-between px-1 h-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[4, 8, 12, 8, 4].map((h, i) => (
                <motion.span
                  key={i}
                  className="w-1 bg-white/70 dark:bg-indigo-300 rounded"
                  animate={{ height: ["4px", `${h}px`, "4px"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                />
              ))}
         {position && (
            <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/80 text-white text-xs font-bold shadow-md">
              #{position}
            </div>
          )}
            </motion.div>
          )}

          {/* Play Button on image */}
          {item.previewUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="
                absolute bottom-3 right-3 w-10 h-10 sm:w-11 sm:h-11 rounded-full 
                bg-black/70 hover:bg-black/90 
                text-white flex items-center justify-center
                backdrop-blur-md
              "
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
          )}
        </div>

        {/* Info Section */}
        <div className="p-4 space-y-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-black dark:text-white text-base truncate">
                {item.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                By{" "}
                <span className="font-semibold italic text-black dark:text-white">
                  {item.producerName}
                </span>
              </p>
            </div>

            {/* Info icon */}
            <button
              aria-label="open-button"
              onClick={() => setOpen(true)}
              className="text-gray-400 hover:text-indigo-500 transition"
            >
              <Info size={18} />
            </button>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {item.genre && <span className="tag-indigo">{item.genre}</span>}
            {item.bpm && <span className="tag-green">{item.bpm} BPM</span>}
            {item.key && <span className="tag-purple">Key {item.key}</span>}
          </div>

          {/* Price + Cart */}
          <div className="flex items-center justify-between pt-3">
            <span className="font-bold text-black dark:text-white text-base">
              {item.price ? `$${item.price}` : "Free"}
            </span>

            <button
              onClick={handleAddToCart}
              disabled={inCart}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-lg 
                text-white text-xs font-semibold shadow-md transition
                ${inCart ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600"}
              `}
            >
              {inCart ? <GiCheckMark size={14} /> : <FaPlus size={14} />}
              {inCart ? "In Cart" : "Full Beat"}
            </button>
          </div>
        </div>

        {/* Hidden Audio */}
        {item.previewUrl && (
          <audio
            ref={audioRef}
            src={item.previewUrl}
            onEnded={() => setIsPlaying(false)}
          />
        )}
      </motion.div>

      {/* ---- MODAL ---- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md sm:max-w-lg md:rounded-2xl p-6 bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-md italic text-black">Beat Info</h3>
            <button
              aria-label="close-button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-full text-black hover:bg-black/10 dark:hover:bg-white/10"
            >
              <IoIosClose size={30} />
            </button>
          </div>

          <Separator />

          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{item.title}</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Produced by <span className="font-semibold">{item.producerName}</span>
            </DialogDescription>
          </DialogHeader>

          {/* Modal Content */}
          <div className="mt-4">
            <div className="relative w-full h-52 rounded-xl overflow-hidden">
              {item.image ? (
                <Image src={item.image} alt={item.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-neutral-800" />
              )}
            </div>

            {item.previewUrl && (
              <div className="flex items-center justify-center mt-4">
                <audio ref={modalAudio} src={item.previewUrl} />
                <button
                  onClick={toggleModalPlay}
                  className="w-12 h-12 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center shadow-lg"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {item.genre && <span className="tag-indigo">{item.genre}</span>}
              {item.bpm && <span className="tag-green">{item.bpm} BPM</span>}
              {item.key && <span className="tag-purple">Key {item.key}</span>}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="font-bold text-lg text-black">
                {item.price ? `$${item.price}` : "Free"}
              </span>

              <button
                onClick={handleAddToCart}
                disabled={inCart}
                className={`px-4 py-2 rounded-lg text-white font-semibold shadow-md ${
                  inCart ? "bg-gray-400 dark:bg-gray-600" : "bg-indigo-500 hover:bg-indigo-600"
                }`}
              >
                {inCart ? <GiCheckMark className="inline" /> : <FaPlus className="inline" />}{" "}
                {inCart ? "In Cart" : "Get Full Beat"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
