"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { ArtistCard } from "@/components/artists/ArtistCard";

const artists = [
  { id: 1, name: "Cleo Ice Queen", image: "/assets/images/cleo-blog01.jpg", followers: 125000, totalSongs: 45, topTracks: ["Power", "Queen Energy", "Sky High"], region: "africa" },
  { id: 2, name: "Rich Bizzy", image: "/assets/images/bizzy02.jpg", followers: 98000, totalSongs: 38, topTracks: ["Street Anthem", "Hustle Hard", "Rhythm Flow"], region: "global" },
  { id: 3, name: "Maya Lee", image: "/assets/images/cleo-07.jpg", followers: 76000, totalSongs: 22, topTracks: ["Sky High", "Moonlight", "Dreamscape"], region: "us" },
  { id: 4, name: "DJ Sonic", image: "/assets/images/bizzy06.jpg", followers: 112000, totalSongs: 50, topTracks: ["Rhythm Nation", "Electric Vibes", "Bassline"], region: "global" },
];

const itemsPerPage = 4;
const alphabet = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

export default function ArtistsPage() {
  const [region, setRegion] = useState("global");
  const [sort, setSort] = useState("popular");
  const [letter, setLetter] = useState("All");
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Filter + sort artists efficiently
  const filteredArtists = useMemo(() => {
    let list = [...artists];

    if (region !== "global") list = list.filter((a) => a.region === region);
    if (letter !== "All") list = list.filter((a) => a.name.toUpperCase().startsWith(letter));

    switch (sort) {
      case "popular":
        list.sort((a, b) => b.followers - a.followers);
        break;
      case "new":
        list.sort((a, b) => b.totalSongs - a.totalSongs);
        break;
    }

    return list;
  }, [region, sort, letter]);

  // Reset visible items when filters change
  useEffect(() => {
    setVisibleItems(itemsPerPage);
  }, [filteredArtists]);

  // Infinite scroll observer
  const loadMore = useCallback(() => {
    setVisibleItems((prev) => Math.min(prev + itemsPerPage, filteredArtists.length));
  }, [filteredArtists.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "100px", threshold: 0.2 }
    );

    const node = loaderRef.current;
    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [loadMore]);

  return (
    <main className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-black via-slate-900 to-black text-white pt-24 pb-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-blue-400 text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            Artists
          </motion.h1>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <Select onValueChange={setRegion} value={region}>
              <SelectTrigger className="bg-white/10 text-white border-white/20 w-[140px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 text-white">
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="africa">Africa</SelectItem>
                <SelectItem value="us">United States</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={setSort} value={sort}>
              <SelectTrigger className="bg-white/10 text-white border-white/20 w-[140px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 text-white">
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="new">Newcomers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Alphabet Filter */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
        <div className="relative flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          {alphabet.map((ltr) => (
            <Button
              key={ltr}
              size="sm"
              variant={letter === ltr ? "default" : "secondary"}
              onClick={() => setLetter(ltr)}
              className="snap-start flex-shrink-0 px-4"
            >
              {ltr}
            </Button>
          ))}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-background to-transparent z-10" />
        </div>
      </div>

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Main Grid */}
        <div className="lg:col-span-3 grid sm:grid-cols-2 gap-6">
          {filteredArtists.slice(0, visibleItems).map((artist) => (
            <ArtistCard
              key={artist.id}
              id={artist.id}
              name={artist.name}
              image={artist.image}
              topSongs={artist.topTracks}
              totalSongs={artist.totalSongs}
              followers={artist.followers}
              region={artist.region}
            />
          ))}
        </div>

        {/* Sidebar */}
        <aside className="space-y-12">
          <div>
            <h3 className="relative text-slate-900 text-2xl font-extrabold mb-6 tracking-tight">
              <span className="relative z-10 bg-white pr-3">Top Artists</span>
              <span className="absolute left-0 top-1/2 w-full h-[8px] bg-black -z-0"></span>
            </h3>
            <div className="grid gap-6">
              {artists.slice(0, 5).map((a, index) => {
                const rankColors = ["text-yellow-500", "text-gray-400", "text-orange-500"];
                const rankClass = index < 3 ? rankColors[index] : "text-black";

                return (
                  <motion.div
                    key={a.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex gap-3 items-center cursor-pointer border-b border-gray-200 pb-3"
                  >
                    <span className={`text-2xl font-extrabold w-8 text-center ${rankClass}`}>
                      {index + 1}
                    </span>
                    <div className="relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image src={a.image} alt={a.name} fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="text-black text-sm font-semibold line-clamp-2">{a.name}</h4>
                      <p className="text-xs text-gray-500">{a.totalSongs} songs</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-200 h-60 flex items-center justify-center rounded-lg">
            <span className="text-gray-500">Advertisement</span>
          </div>
        </aside>
      </section>

      {/* Infinite Scroll Loader */}
      <div ref={loaderRef} className="h-14 flex justify-center items-center mt-8">
        {visibleItems < filteredArtists.length && (
          <span className="text-gray-500 animate-pulse">Loading more...</span>
        )}
      </div>
    </main>
  );
}
