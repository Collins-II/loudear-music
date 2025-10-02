"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

interface Award {
  year: string;
  title: string;
  organization: string;
  description: string;
}

const awards: Award[] = [
  {
    year: "2023",
    title: "Best Record Label",
    organization: "Zambia Music Awards",
    description: "Recognized for outstanding contributions to the local music industry.",
  },
  {
    year: "2022",
    title: "Top Streaming Artist",
    organization: "African Music Awards",
    description: "Awarded for achieving 10M+ streams across platforms.",
  },
  {
    year: "2021",
    title: "Innovative Music Project",
    organization: "Creative Arts Festival",
    description: "Honored for pushing boundaries in music production & artistry.",
  },
];

export default function AwardsSection() {
  return (
    <section className="w-full py-20 bg-gradient-to-b from-purple-950 via-black to-black text-white">
  <div className="max-w-6xl mx-auto px-6 lg:px-12 text-center">
    {/* Section Header */}
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    >
      <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-fuchsia-400 via-purple-400 to-yellow-400 bg-clip-text text-transparent">
        Awards & Recognitions
      </h2>
      <p className="text-gray-300 max-w-2xl mx-auto italic">
        Honoring Cleo Ice Queen’s trailblazing journey in African music & culture.
      </p>
    </motion.div>

    {/* Awards Grid */}
    <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {awards.map((award, idx) => (
        <motion.div
          key={idx}
          className="p-6 rounded-2xl bg-gradient-to-br from-purple-800/20 via-fuchsia-600/10 to-yellow-500/10 border border-fuchsia-400/30 shadow-lg cursor-pointer"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: idx * 0.2 }}
          whileHover={{
            scale: 1.05,
            rotate: -1,
            boxShadow: "0px 0px 25px rgba(236, 72, 153, 0.6)", // fuchsia glow
          }}
        >
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-10 h-10 text-yellow-400 drop-shadow-lg" />
          </div>
          <h3 className="text-xl font-bold text-white">{award.title}</h3>
          <p className="text-sm text-gray-400">{award.organization}</p>
          <p className="mt-2 text-sm text-gray-300">{award.description}</p>
          <span className="mt-4 inline-block text-xs font-bold text-fuchsia-300 bg-fuchsia-500/20 rounded-full px-3 py-1">
            {award.year}
          </span>
        </motion.div>
      ))}
    </div>

    {/* More Button */}
    <div className="flex items-center justify-end pt-4">
      <Link href={`/awards`}>
        <Button
          size="sm"
          variant="ghost"
          className="text-fuchsia-400 hover:text-black hover:bg-fuchsia-300/90"
        >
          More →
        </Button>
      </Link>
    </div>
  </div>
</section>
  );
}
