"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { eventsData } from "@/data/demo_artists";
import Link from "next/link";

export default function UpcomingEvents() {
  return (
    <section className="px-4 sm:px-6 py-20 overflow-x-hidden bg-gradient-to-b from-black via-orange-950/10 to-black">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-extrabold sm:text-5xl bg-yellow-400 bg-clip-text text-transparent">
          Upcoming Shows
        </h2>
        <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto italic">
          Don’t miss Rich Bizzy live — Afro-Pop energy that lights up every stage.
        </p>
      </div>

      <div className="mx-auto max-w-6xl flex flex-col lg:flex-row gap-6 lg:gap-12">
        {/* Banner */}
        <div className="w-full lg:w-1/3 h-64 sm:h-96 lg:h-[600px] rounded-3xl shadow-xl overflow-hidden relative border border-yellow-400/20">
          <Image
            src="/assets/images/bizzylive02.jpg"
            alt="Rich Bizzy Live Banner"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        {/* Events List */}
        <div className="w-full lg:w-2/3 space-y-4 max-h-[800px] overflow-y-auto pt-2 px-2 sm:px-4 custom-scrollbar">
          {eventsData.map((event) => (
            <motion.div
              key={event.id}
              whileHover={{
                scale: 1.02,
                boxShadow: "0px 0px 25px rgba(234, 88, 12, 0.4)", // orange glow
              }}
              className="group flex flex-col sm:flex-row sm:items-center justify-between border border-orange-400/40 gap-4 bg-gradient-to-b from-black/40 via-black/20 to-black/30 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-lg cursor-pointer"
            >
              {/* Date */}
              <div className="flex flex-col items-start text-white/70 flex-shrink-0">
                <span className="text-2xl font-bold text-yellow-400">
                  {new Date(event.date).getDate()}
                </span>
                <span className="text-sm font-semibold text-white">
                  {new Date(event.date).toLocaleString("default", {
                    month: "short",
                  })}
                </span>
              </div>

              {/* Title & Location */}
              <div className="flex-1 flex flex-col items-start text-white/80 text-sm">
                <span className="text-lg sm:text-xl font-bold text-white">
                  {event.title}
                </span>
                <div className="flex items-center gap-1 text-orange/40">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </div>
              </div>

              {/* Button */}
              <Button className="rounded-xl bg-yellow-700 hover:bg-yellow-600 hover:to-yellow-500 text-white shadow-md">
                Tickets ({event.priceRange})
              </Button>
            </motion.div>
          ))}

          <div className="flex items-center justify-end">
            <Link href={`/events`}>
              <Button
                size="sm"
                variant="ghost"
                className="text-yellow-400 hover:text-black hover:bg-yellow-400/90"
              >
                More →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
