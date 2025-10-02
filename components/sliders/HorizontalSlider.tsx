"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReactNode, useRef } from "react";

interface HorizontalSliderProps {
  title?: string;
  children: ReactNode[];
  className?: string;
  gap?: number; // optional gap between items
}

export default function HorizontalSlider({
  title,
  children,
  className = "",
  gap = 4,
}: HorizontalSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (amount: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: amount, behavior: "smooth" });

      // ✅ Infinite scroll behavior
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;

      // if scrolled to end, wrap around
      if (scrollLeft + clientWidth >= scrollWidth - 10 && amount > 0) {
        containerRef.current.scrollTo({ left: 0, behavior: "smooth" });
      }

      // if scrolled to start, wrap to end
      if (scrollLeft <= 0 && amount < 0) {
        containerRef.current.scrollTo({ left: scrollWidth, behavior: "smooth" });
      }
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* header */}
      <div className="flex items-center justify-between mb-4 px-6 md:px-0">
        {title && (
          <h3 className="w-full relative text-slate-900 text-2xl md:text-3xl font-extrabold tracking-tight">
            <span className="relative z-10 bg-white pr-3">{title}</span>
            <span className="hidden md:block absolute left-0 top-1/2 w-full h-[8px] bg-black -z-0"></span>
          </h3>
        )}

        {/* arrows */}
        <div className="flex items-center gap-4 ml-4">
          <button
            aria-label="scroll left"
            onClick={() => scrollByAmount(-300)}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
          >
            <ChevronLeft className="w-5 h-5 text-black" />
          </button>
          <button
            aria-label="scroll right"
            onClick={() => scrollByAmount(300)}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
          >
            <ChevronRight className="w-5 h-5 text-black" />
          </button>
        </div>
      </div>

      {/* scroll container */}
      <div className="relative group">
        <motion.div
          ref={containerRef}
          className={`flex overflow-x-auto scrollbar-hide gap-${gap} px-4 py-2 scroll-smooth`}
          drag="x"
          dragConstraints={{ left: -1000, right: 0 }}
        >
          {children.map((child, index) => (
            <motion.div
              key={index}
              className="flex-shrink-0 min-w-[70%] sm:min-w-[40%] md:min-w-[30%] lg:min-w-[20%]"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {child}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
