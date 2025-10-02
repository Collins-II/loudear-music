"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Calendar, Youtube } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface Props {
  subtitle : string;
}

export default function SectionHero({subtitle}: Props) {
  const pathname = usePathname();

  return (
    <section className="relative w-full overflow-hidden bg-black text-white">
      {/* Background with spotlight gradient */}
      <div className="absolute inset-0">
        <Image
          src="/assets/images/bizzy03.jpg" // Replace with Yo Maps promo image
          alt="Cleo Ice Queen"
          fill
          priority
          className="object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative mx-auto grid max-w-7xl min-h-7/screen grid-cols-1 items-center gap-10 px-6 py-20 md:grid-cols-2">
        {/* LEFT — Artist Intro */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block mb-4 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80 backdrop-blur-md">
            Zambia • Afro Pop • Dancehall Vibes
          </span>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent">
              Rich Bizzy
            </span>
            <span className="block mt-2 text-white">
              {pathname === "/music" ? "MUSIC" : pathname === "/videos" ? "VIDEOS" : pathname === "/events" ? "EVENTS":pathname === "/merch" ?  "MERCH" : "AWARDS & RECOGNITIONS"}
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-base md:text-lg text-white/80">
            {subtitle}
          </p>

        </motion.div>

        {/* RIGHT — Featured Track / Player */}
               <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.9, delay: 0.2 }}
                  className="flex flex-col items-center md:items-end"
                >
                  {/* Album Art with hover animation */}
                  <motion.div
                    whileHover={{
                      scale: 1.05,
                      rotate: 1,
                      boxShadow: "0px 0px 30px rgba(250, 149, 34, 0.6)", // Green glow
                    }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="relative w-72 h-72 rounded-2xl overflow-hidden shadow-2xl shadow-yellow-600/40 border border-white/10 cursor-pointer"
                  >
                    <Image
                      src="/assets/images/bizzy01.jpg"
                      alt="Featured Album"
                      fill
                      className="object-cover"
                    />
                    {/* Glow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </motion.div>
        
                  {/* Mini tagline below cover */}
                  <p className="mt-4 text-sm text-white/70 italic">
                    🎶 Latest Album: <span className="font-semibold">The Boss Is Back</span> 🎶
                  </p>
          </motion.div>
      </div>
    </section>
  );
}
