"use client";

import { useState, useEffect, useRef, useDeferredValue } from "react";
import { PlaylistCard } from "@/components/playlists/PlaylistCard";
import { TopPlaylist } from "@/components/playlists/TopPlaylist";
import Link from "next/link";
import { fetchPlaylists } from "@/lib/spotify";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { DropdownRadio } from "@/components/DropdownRadio";

export interface Playlist {
  id: string;
  title: string;
  curator: string;
  image: string;
  tracks: number;
  plays?: number;
  lastWeek?: number;
}

const moods = ["All", "Love", "Party", "Rap", "Melody"];
const regions = ["global", "africa", "us"] as const;
const sorts = ["popular", "recent"] as const;

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    region: "global" as "global" | "africa" | "us",
    sort: "popular" as "popular" | "recent",
    mood: "All",
    view: "grid" as "grid" | "chart",
  });

  const deferredFilters = useDeferredValue(filters);
  const itemsPerPage = 6;
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Fetch playlists whenever filters change
  useEffect(() => {
    setLoading(true);
    fetchPlaylists(deferredFilters.mood).then((data) => {
      setPlaylists(data);
      setLoading(false);
      setVisibleItems(itemsPerPage);
    });
  }, [deferredFilters]);

  // Reset visible items on filter change
  useEffect(() => {
    setVisibleItems(itemsPerPage);
  }, [filters]);

  // Infinite scroll for grid view
  useEffect(() => {
    if (filters.view === "chart") return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleItems((prev) => Math.min(prev + itemsPerPage, playlists?.length));
      }
    });

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [playlists, filters.view]);

  const clearFilters = () => {
    setFilters({
      region: "global",
      sort: "popular",
      mood: "All",
      view: "grid",
    });
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-xl font-bold">Loading playlists...</div>;

  return (
    <main className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-black via-gray-900 to-black text-white pt-24 pb-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold bg-blue-400 bg-clip-text text-transparent">
              Discover Playlists
            </h1>
            <div className="mt-6 flex gap-3">
              <Button
                variant={filters.view === "grid" ? "default" : "secondary"}
                onClick={() => setFilters((f) => ({ ...f, view: "grid" }))}
              >
                Grid View
              </Button>
              <Button
                variant={filters.view === "chart" ? "default" : "secondary"}
                onClick={() => setFilters((f) => ({ ...f, view: "chart" }))}
              >
                Weekly Chart
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <Select
              value={filters.region}
              onValueChange={(val) => setFilters((f) => ({ ...f, region: val as any }))}
            >
              <SelectTrigger className="bg-black text-white w-[160px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white">
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>{r.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.sort}
              onValueChange={(val) => setFilters((f) => ({ ...f, sort: val as any }))}
            >
              <SelectTrigger className="bg-black text-white w-[160px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white">
                {sorts.map((s) => (
                  <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DropdownRadio
              actionLabel="Mood"
              label="Select Mood"
              data={moods}
              onChange={(val) => setFilters((f) => ({ ...f, mood: val }))}
            />

            <Button variant="secondary" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Main Grid */}
        <div className="lg:col-span-3">
          {filters.view === "chart" ? (
            <div className="space-y-4 pb-12">
              <h3 className="relative text-slate-900 text-2xl font-extrabold mb-6 tracking-tight">
                <span className="relative z-10 bg-white pr-3">Weekly Chart</span>
                <span className="absolute left-0 top-1/2 w-full h-[8px] bg-black -z-0"></span>
              </h3>
              <div className="divide-y">
                {playlists?.map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-4 py-4">
                    <div className="text-3xl font-extrabold text-black w-10">{idx + 1}</div>
                    <img src={p.image} alt={p.title} className="w-16 h-16 object-cover rounded-md" />
                    <div className="flex-1">
                      <p className="font-bold">{p.title}</p>
                      <p className="text-sm text-gray-600">{p.curator}</p>
                    </div>
                    <div className="text-sm text-gray-500">Last week: {p.lastWeek ?? "-"}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <h3 className="relative text-slate-900 text-2xl font-extrabold mb-6 tracking-tight">
                <span className="relative z-10 bg-white pr-3">Top Playlists</span>
                <span className="absolute left-0 top-1/2 w-full h-[8px] bg-black -z-0"></span>
              </h3>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 pb-12">
                {playlists?.slice(0, visibleItems).map((p, idx) => (
                    <PlaylistCard
                      key={idx}
                      id={p.id}
                      title={p.title}
                      cover={p.image}
                      creator={p.curator}
                      songs={p.tracks}
                      likes={Math.floor(Math.random() * 100000)}
                    />
                ))}
              </div>

              <div ref={loaderRef} className="h-12 flex justify-center items-center">
                {visibleItems < playlists?.length && <span className="text-gray-500">Loading more...</span>}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-12">
          <div className="rounded-xl overflow-hidden shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
            <h4 className="text-xl font-bold">🔥 Featured Mix</h4>
            <p className="text-sm mt-2">Fresh playlists curated for you</p>
            <Button className="mt-4 bg-white text-black hover:bg-gray-200">Listen Now</Button>
          </div>

          <div>
            <h3 className="relative text-slate-900 text-2xl font-extrabold mb-6 tracking-tight">
              <span className="relative z-10 bg-white pr-3">Top 10 Playlists</span>
              <span className="absolute left-0 top-1/2 w-full h-[8px] bg-black -z-0"></span>
            </h3>
            <div className="grid gap-4">
              {playlists?.slice(0, 10).map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-black">{i + 1}</span>
                  <TopPlaylist 
                   id={p.id}
                   title={p.title}
                   curator={p.curator}
                   image={p.image}
                   plays={p.plays as number}
                 />
                </div>
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
