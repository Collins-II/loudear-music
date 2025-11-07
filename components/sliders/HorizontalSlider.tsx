"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { ReactNode, useRef } from "react";

interface HorizontalSliderProps {
  title?: string;
  children: ReactNode;
  className?: string;
  gap?: "sm" | "md" | "lg";
}

export default function HorizontalSlider({
  title,
  children,
  className = "",
  gap = "md",
}: HorizontalSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (amount: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const gapClass =
    gap === "sm" ? "gap-2" : gap === "lg" ? "gap-8" : "gap-4";

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 md:px-0">
        {title && (
          <h3 className="relative text-slate-900 dark:text-white text-2xl md:text-3xl font-extrabold tracking-tight">
            <span className="relative z-10 pr-3 bg-background">{title}</span>
            <span className="hidden md:block absolute left-0 top-1/2 w-full h-[8px] bg-black/80 -z-0"></span>
          </h3>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3 ml-3">
          <button
            aria-label="scroll left"
            onClick={() => scrollByAmount(-300)}
            className="p-2 bg-white dark:bg-black/70 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ChevronLeft className="w-5 h-5 text-black dark:text-white" />
          </button>
          <button
            aria-label="scroll right"
            onClick={() => scrollByAmount(300)}
            className="p-2 bg-white dark:bg-black/70 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ChevronRight className="w-5 h-5 text-black dark:text-white" />
          </button>
        </div>
      </div>

      {/* Scroll container */}
      <div className="relative">
        <div
          ref={containerRef}
          className={`flex overflow-x-auto overflow-y-hidden ${gapClass} px-4 py-2 
          scroll-smooth snap-x snap-mandatory scrollbar-hide
          touch-pan-x md:touch-auto 
          webkit-scroll-touch touch-pan-y touch-pinch-zoom`}
        >
          {children &&
            // ✅ Safely map children using React.Children.map
            React.Children.map(children, (child, index) => (
              <motion.div
                key={index}
                className="flex-shrink-0 snap-center min-w-[80%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[25%]"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {child}
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}
