import { demoArtists } from "@/data/demo_artists";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "./badge";

function ArtistsGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {demoArtists.map((a, i) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-white shadow-lg"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.img} alt={a.name} className="h-40 w-full object-cover" />
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold tracking-tight">{a.name}</p>
                <p className="text-xs text-white/70">{a.role}</p>
              </div>
              <Badge className="bg-white/10 text-white/90">Artist</Badge>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default ArtistsGrid;
