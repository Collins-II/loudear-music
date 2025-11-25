"use client";

import React, { useCallback, useEffect, useRef, useState, JSX } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X as XIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchCard from "@/components/search/SearchCard";
import SkeletonSearch from "@/components/skeletons/search-skeleton";

/* ---------------------------
   Types
----------------------------*/
type ResultType = "song" | "album" | "video";
type SortOption = "relevance" | "newest" | "popular";

interface SearchResultBase {
  id: string;
  type: ResultType;
  title: string;
  artist?: string;
  image?: string;
  genre?: string;
  href: string;
  releaseDate?: string;
  stats?: {
    plays?: number;
    views?: number;
    downloads?: number;
    likes?: number;
  };
  extra?: { previewUrl?: string };
}

interface SearchResponse {
  results: SearchResultBase[];
  total: number;
  page: number;
  limit: number;
}

export interface TrendingItem {
  id: string;
  title: string;
  artist?: string;
  cover?: string;
  rank: number;
  score?: number;
  model?: string;
  genre?: string;
  createdAt: string;
}

/* ---------------------------
   Utils & Hooks
----------------------------*/
const DEFAULT_LIMIT = 20;

function useDebounced<T>(value: T, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function ResultTile({ item, rank }: { item: SearchResultBase; rank?: number }) {

  return (
    <SearchCard item={item} rank={rank} />
  );
}

/* ---------------------------
   Trending Leaderboard
----------------------------*/
export function TrendingLeaderboard({ list }: { list: TrendingItem[] }) {
  return (
    <section className="rounded-2xl bg-gradient-to-r from-pink-600 via-red-500 to-orange-400 text-white py-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold">Global Trends</h3>
        <div className="text-xs opacity-90">Updated weekly</div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {list.slice(0, 6).map((t) => (
          <div key={t.id} className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
            <div className="w-12 h-12 relative flex-shrink-0">
              {t.cover ? (
                <Image src={t.cover} fill className="object-cover rounded-md" alt={t.title} />
              ) : (
                <div className="bg-white/20 w-full h-full rounded-md flex items-center justify-center text-sm">
                  {t.rank}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="capitalize text-sm font-semibold truncate">{t.title}</div>
              <div className="text-xs opacity-90">{t.artist ?? "Various"}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">#{t.rank}</div>
              <div className="text-xs opacity-90">{t.score ? t.score.toFixed(0) : "—"}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------
   MAIN PAGE
----------------------------*/
export default function InteractiveSearchPage(): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();

  const [query, setQuery] = useState(params.get("q") || "");
  const [type] = useState<"all" | ResultType>(
    (params.get("type") as any) || "all"
  );
  const [genre] = useState(params.get("genre") || "All");
  const [sort ] = useState<SortOption>(
    (params.get("sort") as SortOption) || "relevance"
  );

  const debouncedQuery = useDebounced(query, 400);
  const [results, setResults] = useState<SearchResultBase[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  /* ✨ Sync URL when filters change */
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("q", query);
    url.searchParams.set("type", type);
    url.searchParams.set("genre", genre);
    url.searchParams.set("sort", sort);
    router.replace(url.pathname + "?" + url.searchParams.toString());
  }, [query, type, genre, sort, router]);

  /* 🔍 Fetch results */
  const fetchResults = useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(debouncedQuery)}&type=${type}&genre=${genre}&sort=${sort}&page=${page}&limit=${DEFAULT_LIMIT}`
      );
      if (!res.ok) throw new Error("Failed to fetch results");
      const data = (await res.json()) as SearchResponse;
      setResults(data.results);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, type, genre, sort, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  /* 🧠 Fetch trending */
  useEffect(() => {
    fetch("/api/trending/global?limit=6")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setTrending(data.items || []))
      .catch(() => {});
  }, []);

  /* ♾ Infinite Scroll */
  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && results.length < total) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 1 }
    );
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [loaderRef, loading, results.length, total]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-black text-white pt-12">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            <span className="text-white">LoudEar </span>
            <span className="bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
              Search
            </span>
          </h1>
          <p className="mt-3 text-sm text-gray-400 max-w-2xl">
            Discover songs, albums, and videos instantly.
          </p>
        </div>
      </header>

      {/* Search Input */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full md:w-3/5 mx-auto border border-white/10 bg-neutral-900/80 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Search songs, artists, albums..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-3 py-2 bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none"
          />
          {query && (
            <Button
              type="button"
              onClick={() => setQuery("")}
              size="sm"
              variant="ghost"
              className="rounded-full bg-white hover:bg-white/10"
            >
              <XIcon className="w-4 h-4 text-black" />
            </Button>
          )}
        </motion.form>

        {/* Filters 
        <div className="mt-6 flex flex-wrap justify-center md:justify-between items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {(["all", "song", "album", "video"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${
                  type === t
                    ? "bg-white text-black border-transparent"
                    : "bg-neutral-900 border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <select
              aria-label="select-button"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="rounded-full bg-neutral-900 border border-white/10 text-sm px-3 py-1.5 text-gray-300"
            >
              {["All", "Hip Hop", "Pop", "Afrobeat", "RnB", "Gospel"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>

            <select
              aria-label="select-button"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-full bg-neutral-900 border border-white/10 text-sm px-3 py-1.5 text-gray-300"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>*/}

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-10">
          <div className="lg:col-span-8">
            <h2 className="text-2xl font-bold mb-4">Search Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AnimatePresence>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonSearch key={i} />)
                  : results.map((r, idx) => (
                      <ResultTile key={`${r.type}-${r.id}`} item={r} rank={idx + 1} />
                    ))}
              </AnimatePresence>
            </div>
            <div ref={loaderRef} className="h-16 flex items-center justify-center mt-10 text-sm text-gray-500">
              {loading
                ? "Loading..."
                : results.length < total
                ? "Scroll to load more…"
                : total > 0
                ? "End of results"
                : query
                ? "No results found"
                : ""}
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <TrendingLeaderboard list={trending} />
          </aside>
        </div>
      </section>
    </main>
  );
}
