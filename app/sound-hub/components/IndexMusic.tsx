// app/beats/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DropdownRadio } from "@/components/DropdownRadio";
import { ChartRow } from "@/components/music/ChartRow";
import BeatCard from "@/components/soundhub/BeatCard";
import SkeletonList from "@/components/skeletons/skeleton-list";
import MusicCardSkeleton from "@/components/skeletons/music-card-skeleton";
import TopCardSkeleton from "@/components/skeletons/top-card-skeleton";
import { getSocket } from "@/lib/socketClient";

import type { BeatItem } from "@/actions/getBeats";
import TopBeatCard from "@/components/soundhub/TopBeatCard";
import ThemedHeading from "@/components/themed-heading";

const genres = ["All", "Hip Hop", "Afro Pop", "Gospel", "RnB", "Dancehall"];
const alphabet = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"] as const;

type ViewMode = "grid" | "chart";
type Sort = "latest" | "popular" | "price-low" | "price-high";
type FilterType = "latest" | "trending" | "a-z" | "genre";

export default function BeatsWrapper() {
  const [initialBeats, setInitialBeats] = useState<BeatItem[]>([]);
  const [topBeats, setTopBeats] = useState<BeatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await fetch("/api/beat");
        if (!res.ok) throw new Error("Failed loading beats");
        const { beats } = await res.json();

        setInitialBeats(beats || []);

        const top = (beats || [])
          .slice()
          .sort((a: any, b: any) => (b.stats?.plays ?? 0) - (a.stats?.plays ?? 0))
          .slice(0, 10);

        setTopBeats(top);
      } catch (err) {
        console.error("Error loading beats:", err);
      } finally {
        setLoading(false);
      }
    }

    loadInitial();
  }, []);

  if (loading) {
    return (
      <main className="bg-background min-h-screen px-6 md:px-12 py-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Skeleton Main Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <MusicCardSkeleton key={i} />
            ))}
          </div>

          {/* Chart Skeleton */}
          <SkeletonList count={5} />
        </div>

        {/* Sidebar Skeleton */}
        <aside className="space-y-12">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <TopCardSkeleton key={i} />
            ))}
          </div>

          <div className="bg-gray-200 h-60 flex items-center justify-center rounded-lg">
            <span className="text-gray-500">Advertisement</span>
          </div>
        </aside>
      </main>
    );
  }

  return <BeatsPage initialBeats={initialBeats} topBeats={topBeats} />;
}

function BeatsPage({ initialBeats, topBeats }: { initialBeats: BeatItem[]; topBeats: BeatItem[] }) {
  const [filters, setFilters] = useState({
    filter: "latest" as FilterType,
    genre: "All",
    letter: "All",
    sort: "latest" as Sort,
    view: "grid" as ViewMode,
    q: "",
  });

  const socket = getSocket();
  const [beats, setBeats] = useState<BeatItem[]>(initialBeats);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 15;
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // fetch beats when genre/sort changes
  useEffect(() => {
    async function fetchBeats() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.genre && filters.genre !== "All") params.set("genre", filters.genre);
        // sort param optional - backend can handle or we sort client-side
        const res = await fetch(`/api/beat?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch beats");
        const { beats: data } = await res.json();
        setBeats(data || []);
      } catch (err) {
        console.error("Failed to fetch beats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBeats();
  }, [filters.genre, filters.sort]);

  // socket updates
  useEffect(() => {
    function handler(payload: any) {
      if (payload?.items) {
        setBeats(payload.items);
      } else if (payload?.beatId && payload?.data) {
        setBeats((prev) => prev.map((b) => (b._id === payload.beatId ? { ...b, ...payload.data } : b)));
      }
    }

    socket.on("beats:update", handler);
    return () => {
      socket.off("beats:update", handler);
    };
  }, [socket]);

  const filteredBeats = useMemo(() => {
    let list = [...beats];

    // text search
    if (filters.q && filters.q.trim()) {
      const q = filters.q.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.producerName?.toLowerCase().includes(q) ||
          b.genre?.toLowerCase().includes(q)
      );
    }

    // genre filter (when using DropdownRadio we set filter to 'genre')
    if (filters.filter === "genre" && filters.genre !== "All") {
      list = list.filter((b) => (b.genre ?? "").toLowerCase() === filters.genre.toLowerCase());
    }

    // A-Z
    if (filters.filter === "a-z" && filters.letter !== "All") {
      list = list.filter((b) => {
        const first = (b.title ?? "").charAt(0).toUpperCase();
        const firstProducer = (b.producerName ?? "").charAt(0).toUpperCase();
        return first === filters.letter || firstProducer === filters.letter;
      });
      list.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    }

    // latest (two-weeks window)
    if (filters.filter === "latest") {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      list = list.filter((b) => {
        if (!b.releaseDate) return false;
        return new Date(b.releaseDate) >= twoWeeksAgo;
      });
      list.sort((a, b) => new Date(b.releaseDate ?? "").getTime() - new Date(a.releaseDate ?? "").getTime());
    }

    // trending
    if (filters.filter === "trending") {
      list = list.sort((a, b) => (b.stats?.plays ?? 0) - (a.stats?.plays ?? 0));
    }

    // sort options
    if (filters.sort === "latest") {
      list.sort((a, b) => new Date(b.releaseDate ?? "").getTime() - new Date(a.releaseDate ?? "").getTime());
    } else if (filters.sort === "popular") {
      list.sort((a, b) => (b.stats?.plays ?? 0) - (a.stats?.plays ?? 0));
    } else if (filters.sort === "price-low") {
      list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (filters.sort === "price-high") {
      list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    }

    return list;
  }, [beats, filters]);

  // reset visible when filters change
  useEffect(() => setVisibleItems(itemsPerPage), [filters]);

  // infinite observer for chart view
  useEffect(() => {
    if (filters.view === "grid") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleItems((prev) => Math.min(prev + itemsPerPage, filteredBeats.length));
        }
      },
      { threshold: 1 }
    );

    const current = loaderRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [filteredBeats, filters.view]);

  const clearFilters = () =>
    setFilters({
      filter: "latest",
      genre: "All",
      letter: "All",
      sort: "latest",
      view: "grid",
      q: "",
    });

  return (
    <main className="bg-background min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-black via-gray-900 to-black text-white pt-24 pb-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-6">
          <div>
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-blue-400 text-4xl md:text-6xl font-extrabold tracking-tight"
            >
              Beat Marketplace
            </motion.h1>

            {/* View toggle */}
            <div className="mt-6 flex gap-3">
              <Button variant={filters.view === "grid" ? "secondary" : "default"} onClick={() => setFilters((f) => ({ ...f, view: "grid" }))}>
                Grid View
              </Button>
              <Button variant={filters.view === "chart" ? "secondary" : "default"} onClick={() => setFilters((f) => ({ ...f, view: "chart" }))}>
                Top Chart
              </Button>
            </div>
          </div>

          {/* Filters */}
          <section className="flex flex-col flex-wrap gap-6 items-center lg:items-end justify-center">

            <div className="flex flex-wrap w-full items-center justify-start gap-4">
              {/* A–Z filter */}
              <DropdownRadio
                actionLabel="A–Z"
                label="Alphabet"
                data={alphabet as unknown as string[]}
                onChange={(val) => setFilters((f) => ({ ...f, letter: val, filter: "a-z" }))}
              />

              {/* Genre */}
              <DropdownRadio
                actionLabel="Genre"
                label="Genre"
                data={genres}
                onChange={(val) => setFilters((f) => ({ ...f, genre: val, filter: "genre" }))}
              />

              {/* Sort */}
              <DropdownRadio
                actionLabel="Sort"
                label="Sort"
                data={["latest", "popular", "price-low", "price-high"]}
                onChange={(val) => setFilters((f) => ({ ...f, sort: val as Sort }))}
              />

              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </section>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Main */}
        <div className="lg:col-span-3">
          {loading ? (
            filters.view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <MusicCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <SkeletonList count={10} />
            )
          ) : filters.view === "chart" ? (
            <div className="space-y-4">
              <ThemedHeading>
                {`Top Beats (${filters.sort})`}
              </ThemedHeading>

              <div className="divide-y bg-white/5 rounded-lg overflow-hidden">
                {filteredBeats.slice(0, visibleItems).map((item, i) => {
                  const position = i + 1;
                  return (
                    <ChartRow
                      key={item._id}
                      idx={position}
                      title={item.title}
                      artist={item.producerName ?? ""}
                      href={`/beats/${item._id}`}
                      cover={item.image as string}
                      thisWeek={position}
                      lastWeek={null}
                    />
                  );
                })}
              </div>

              <div ref={loaderRef} className="h-12 flex justify-center items-center">
                {visibleItems < filteredBeats.length && <span className="text-gray-500">Loading more...</span>}
              </div>
            </div>
          ) : (
            <>
              <ThemedHeading>
                {filters.filter === "a-z" ? "Browse A–Z" : "Latest Beats"}
              </ThemedHeading>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                {filteredBeats.slice(0, visibleItems).map((item) => (
                  <BeatCard
                    key={item._id}
                    item={{
                      id: item._id,
                      title: item.title,
                      producer: item.producerName as string,
                      image: item.image,
                      previewUrl: item.previewUrl ?? item.audioUrl,
                      genre: item.genre,
                      bpm: item.bpm,
                      key: item.key,
                      price: item.price,
                    }}
                  />
                ))}
              </div>

              <div ref={loaderRef} className="h-12 flex justify-center items-center">
                {visibleItems < filteredBeats.length && <span className="text-gray-500">Loading more...</span>}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-12">
          <div>
              <ThemedHeading>
                Top 10 Beats
              </ThemedHeading>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1">
              {topBeats.map((track, index) => (
                <TopBeatCard
                  key={track._id}
                  position={index + 1}
                  item={track}
                />
              ))}
            </div>
          </div>

          <div className="bg-gray-200 h-60 flex items-center justify-center rounded-lg">
            <span className="text-gray-500">Advertisement</span>
          </div>
        </aside>
      </section>
    </main>
  );
}
