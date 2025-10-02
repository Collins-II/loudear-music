"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ResultCard } from "@/components/search/ResultCard";
import { AdSlot } from "@/components/ads/AdSlot";
import { Search, Loader2 } from "lucide-react";

type ContentType = "Music" | "Video" | "Album";

interface SearchItem {
  id: string;
  title: string;
  artist?: string;
  thumbnail: string;
  type: ContentType;
  downloads?: number;
  description?: string;
  tracks?: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ContentType | "All">("All");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const limit = 12;

  const fetchItems = async (reset = false) => {
    const res = await fetch(
      `/api/search?q=${encodeURIComponent(query)}&type=${typeFilter}&page=${
        reset ? 1 : page
      }&limit=${limit}`
    );
    const data = await res.json();
    if (reset) {
      setItems(data.data);
    } else {
      setItems((prev) => [...prev, ...data.data]);
    }
    setHasMore(page * limit < data.total);
  };

  useEffect(() => {
    setPage(1);
    fetchItems(true);
  }, [query, typeFilter]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) setPage((prev) => prev + 1);
      },
      { threshold: 1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasMore]);

  useEffect(() => {
    if (page === 1) return;
    fetchItems();
  }, [page]);

  const groupedByType = items.reduce<Record<ContentType, SearchItem[]>>((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<ContentType, SearchItem[]>);

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-purple-900 via-pink-900 to-indigo-900 border-b">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col items-center space-y-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400"
          >
            Discover Music, Videos & Albums
          </motion.h1>
          <p className="text-gray-300 max-w-2xl">
            Explore trending entertainment content, follow your favorite artists, and experience the beats of the urban world.
          </p>
          <div className="flex flex-wrap gap-4 w-full justify-center mt-6">
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search songs, videos, albums..."
                className="pl-10 pr-4 py-3 rounded-3xl border-none bg-white/10 text-white placeholder-gray-400 shadow-lg focus:ring-2 focus:ring-pink-500 backdrop-blur-sm"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
              <SelectTrigger className="w-40 rounded-3xl border-none bg-white/10 shadow-lg text-white backdrop-blur-sm">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white">
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Music">Music</SelectItem>
                <SelectItem value="Video">Video</SelectItem>
                <SelectItem value="Album">Album</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Results & Ads */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        <AdSlot slot="top-banner" />

        {items.length === 0 && (
          <p className="text-center text-gray-400 font-medium mt-12">
            No results found.
          </p>
        )}

        {Object.entries(groupedByType).map(([type, list]) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-1"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white tracking-wide uppercase">{type}</h2>
              <span className="text-gray-400">{list.length} results</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {list.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border border-white/20 transition-transform duration-300"
                >
                  <ResultCard {...item} />
                </motion.div>
              ))}
            </div>
            <Separator className="border-gray-700" />
            <AdSlot slot={`inline-${type}`} />
          </motion.div>
        ))}

        <div ref={loaderRef} className="h-16 flex justify-center items-center">
          {hasMore && <Loader2 className="w-6 h-6 animate-spin text-gray-400" />}
        </div>

        <AdSlot slot="bottom" />
      </section>
    </main>
  );
}
