"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play, User } from "lucide-react";

export function FeaturedArtist() {
  return (
    <section className="relative bg-gradient-to-br from-background via-muted to-background py-16 px-6 md:px-12 overflow-hidden">
      {/* Background Accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 via-transparent to-yellow-400/10 pointer-events-none" />

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
        {/* Artist Image */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center"
        >
          <div className="relative">
            <Image
              src="/assets/images/bizzy07.jpg"
              alt="Featured Artist"
              width={420}
              height={420}
              className="rounded-2xl shadow-2xl object-cover"
              priority
            />
            <div className="absolute -bottom-4 -right-4 bg-primary text-white text-xs px-4 py-1 rounded-full shadow-lg">
              FridaysPowerAct
            </div>
          </div>
        </motion.div>

        {/* Artist Info */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col space-y-6"
        >
          <h3 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-slate-900">
            Rich Bizzy
          </h3>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
            Experience the latest tracks and videos from{" "}
            <span className="font-semibold text-foreground">Rich Bizzy</span>,
            one of Africa’s most dynamic afro artists. Explore exclusive
            promotions, trending hits, and behind-the-scenes moments.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="gap-2">
              <Play className="w-5 h-5" /> Play Artist
            </Button>
            <Button size="lg" variant="secondary" className="gap-2">
              <User className="w-5 h-5" /> View Profile
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
