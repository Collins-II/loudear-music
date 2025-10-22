"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const img1 = "/assets/images/cleo-01.jpg";
const img2 = "/assets/images/yomaps-02.jpg";
const img3 = "/assets/images/cleo-03.jpg";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Top Charts 2025",
    subtitle: "Stream the hottest tracks trending right now",
    image: img1,
    link: "/charts"
  },
  {
    id: 2,
    title: "Fresh Music Always",
    subtitle: "Discover the newest releases every week",
    image: img2,
    link: "/music"
  },
  {
    id: 3,
    title: "Global Playlists",
    subtitle: "The biggest songs making waves worldwide",
    image: img3,
    link: "/playlists"
  },
];

export default function Hero() {
  const [index, setIndex] = React.useState(0);

  const nextSlide = () => setIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  // Auto slide every 8 seconds
  React.useEffect(() => {
    const timer = setInterval(nextSlide, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full bg-background">
      <div className="relative h-[70vh] sm:h-[80vh] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[index].id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={slides[index].image}
              alt={slides[index].title}
              fill
              priority
              className="object-cover object-center"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-20 left-6 md:left-12 max-w-2xl space-y-4 text-white z-10">
              <motion.h2
                key={slides[index].title}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-6xl font-extrabold drop-shadow-lg leading-tight"
              >
                {slides[index].title}
              </motion.h2>

              <motion.p
                key={slides[index].subtitle}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-base md:text-xl text-gray-200"
              >
                {slides[index].subtitle}
              </motion.p>

              <Link href={slides[index].link}>
              <Button
                size="sm"
                className="rounded-full gap-2 hover:shadow-lg cursor-pointer bg-white text-black hover:scale-90 hover:bg-gray-200 transition"
              >
                <Play className="w-5 h-5" /> Listen Now
              </Button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
          <Button
            size="icon"
            variant="secondary"
            onClick={prevSlide}
            className="rounded-full bg-black/50 hover:bg-black/70 text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>

        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
          <Button
            size="icon"
            variant="secondary"
            onClick={nextSlide}
            className="rounded-full bg-black/50 hover:bg-black/70 text-white"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </section>
  );
}
