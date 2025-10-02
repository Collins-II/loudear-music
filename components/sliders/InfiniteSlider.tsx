"use client";

import { motion } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface InfiniteSliderProps {
  children: ReactNode[];
  gap?: number;
  speed?: number;
  className?: string;
}

export default function InfiniteSlider({
  children,
  gap = 6,
  speed = 50,
  className = "",
}: InfiniteSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate children for infinite scroll effect
  const items = [...children, ...children];

  // Auto-scroll logic
  useEffect(() => {
    if (!containerRef.current) return;

    let start: number | null = null;
    let requestId: number;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const distance = (elapsed / 1000) * speed;

      if (containerRef.current && !isPaused) {
        containerRef.current.scrollLeft = distance % (containerRef.current.scrollWidth / 2);
      }

      requestId = requestAnimationFrame(step);
    };

    requestId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(requestId);
  }, [speed, isPaused]);

  const scrollBy = (offset: number) => {
    if (!containerRef.current) return;
    containerRef.current.scrollLeft += offset;
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Left Arrow */}
      <button
        aria-label="nav-buttons"
        onClick={() => scrollBy(-200)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Right Arrow */}
      <button
        aria-label="nav-buttons"
        onClick={() => scrollBy(200)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slider Container */}
      <motion.div
        ref={containerRef}
        className={`flex gap-${gap} cursor-grab overflow-x-auto scrollbar-none  pb-3`}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        whileTap={{ cursor: "grabbing" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {items.map((child, index) => (
          <motion.div
            key={index}
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
