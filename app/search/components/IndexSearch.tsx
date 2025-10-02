"use client";

import React, { useEffect, useRef, useState, useCallback, JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, X as XIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button"; // optional - replace with native button if not available
//import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"; // optional
import Image from "next/image";
// If those components don't exist in your project, replace with plain elements (I keep imports for parity)

type ResultType = "song" | "album" | "video" | "artist";
type SortOption = "relevance" | "newest" | "popular";

export interface SearchResultBase {
  id: string;
  type: ResultType;
  title: string;
  subtitle?: string; // artist, curator etc.
  image?: string;
  genre?: string;
  releaseDate?: string;
  stats?: {
    plays?: number;
    views?: number;
    downloads?: number;
    likes?: number;
  };
  extra?: any; // backend-specific payload
}

interface SearchResponse {
  results: SearchResultBase[];
  total: number;
  page: number;
  limit: number;
}

/* ---------------------------
   Helpers: debounce + fetch
   --------------------------- */
function useDebouncedValue<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const DEFAULT_LIMIT = 20;

/* ---------------------------
   Small UI pieces
   --------------------------- */
function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white dark:bg-slate-900 rounded-xl p-4 shadow-md">
      <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 rounded-md mb-3" />
      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

function ResultCard({ item }: { item: SearchResultBase }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-lg transition p-3 flex gap-3"
    >
      <div className="relative w-28 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
        {item.image ? (
          // next/image would be ideal; using img for portability
          // Replace with <Image /> when running in Next.js with a loader
          <Image src={item.image} alt={item.title} fill className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-xs">
            {item.type.toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="truncate">
            <div className="text-sm md:text-base font-semibold text-slate-900 dark:text-white truncate">
              {item.title}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {item.subtitle ?? (item.type === "song" ? "Song" : item.type)}
              {item.genre ? ` • ${item.genre}` : ""}
            </div>
          </div>

          <div className="text-right text-xs text-gray-400">
            {item.releaseDate ? new Date(item.releaseDate).getFullYear() : ""}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            {item.stats?.plays !== undefined && <span>{item.stats.plays.toLocaleString()} plays</span>}
            {item.stats?.views !== undefined && <span>{item.stats.views.toLocaleString()} views</span>}
          </div>

          <a
            href={`/view/${item.type}/${item.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
          >
            Open <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------------------
   Main Page
   --------------------------- */
export default function SearchPage(): JSX.Element {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);

  const [type, setType] = useState<"all" | ResultType | "all">("all");
  const [genre, setGenre] = useState<string>("All");
  const [sort, setSort] = useState<SortOption>("relevance");
  const [page, setPage] = useState(1);

  const [results, setResults] = useState<SearchResultBase[]>([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(DEFAULT_LIMIT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // suggestion keyboard nav
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);

  const abortRef = useRef<AbortController | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // fetch function (abortable)
  const fetchPage = useCallback(
    async (q: string, t: string | undefined, g: string | undefined, s: SortOption, p: number, l = limit, append = false) => {
      if (!q || q.trim().length === 0) {
        setResults([]);
        setTotal(0);
        setSuggestions([]);
        return;
      }

      setLoading(true);
      setError(null);
      abortRef.current?.abort();
      const c = new AbortController();
      abortRef.current = c;

      const params = new URLSearchParams({
        q: q.trim(),
        type: t ?? "all",
        genre: g ?? "",
        sort: s,
        page: String(p),
        limit: String(l),
      });

      try {
        const res = await fetch(`/api/search?${params.toString()}`, { signal: c.signal, cache: "no-store" });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const body = (await res.json()) as SearchResponse;

        setTotal(body.total ?? 0);
        setPage(body.page ?? p);
        setResults(prev => (append ? [...prev, ...(body.results ?? [])] : (body.results ?? [])));
      } catch (err: any) {
        if (err.name === "AbortError") {
          // aborted, ignore
        } else {
          console.error("search error", err);
          setError(err.message ?? "Search failed");
        }
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  // fetch suggestions small endpoint (optional)
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      setActiveSuggestion(-1);
      return;
    }

    const controller = new AbortController();
    const doSuggest = async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(debouncedQuery)}`, { signal: controller.signal, cache: "no-store" });
        if (!res.ok) return;
        const body = await res.json();
        setSuggestions(Array.isArray(body.suggestions) ? body.suggestions.slice(0, 6) : []);
      } catch {
        // ignore
      }
    };

    doSuggest();
    return () => controller.abort();
  }, [debouncedQuery]);

  // main effect: run search when debounced query, type, genre, sort changes
  useEffect(() => {
    setPage(1);
    fetchPage(debouncedQuery, type === "all" ? undefined : type, genre === "All" ? undefined : genre, sort, 1, limit, false);
  }, [debouncedQuery, type, genre, sort, fetchPage, limit]);

  // infinite scroll observer to load next page
  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && results.length < total) {
          const next = page + 1;
          fetchPage(debouncedQuery, type === "all" ? undefined : type, genre === "All" ? undefined : genre, sort, next, limit, true);
        }
      },
      { threshold: 1 }
    );
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [loaderRef, loading, results.length, total, page, fetchPage, debouncedQuery, type, genre, sort, limit]);

  // keyboard nav for suggestions
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (suggestions.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion((i) => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        if (activeSuggestion >= 0) {
          setQuery(suggestions[activeSuggestion]);
          setSuggestions([]);
          (document.activeElement as HTMLElement)?.blur?.();
        }
      } else if (e.key === "Escape") {
        setSuggestions([]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [suggestions, activeSuggestion]);

  //const hasResults = results.length > 0;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left: search + filters */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow">
              <label htmlFor="site-search" className="sr-only">Search</label>
              <div className="relative flex items-center gap-2">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="site-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search songs, albums, videos, artists..."
                  className="pl-10 pr-10 py-3 w-full bg-transparent outline-none text-sm sm:text-base text-slate-900 dark:text-white"
                />
                {query && (
                  <button
                    aria-label="Clear query"
                    onClick={() => { setQuery(""); setSuggestions([]); setResults([]); setTotal(0); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XIcon />
                  </button>
                )}
              </div>

              {/* suggestions */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 divide-y rounded-md overflow-hidden border bg-white dark:bg-slate-700 shadow-sm"
                  >
                    {suggestions.map((s, i) => (
                      <li
                        key={s}
                        onMouseDown={(ev) => { ev.preventDefault(); setQuery(s); setSuggestions([]); }}
                        className={`px-3 py-2 text-sm cursor-pointer ${i === activeSuggestion ? "bg-slate-100 dark:bg-slate-600" : "hover:bg-slate-50 dark:hover:bg-slate-600"}`}
                      >
                        {s}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <motion.div layout className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow space-y-3">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Type</h4>
              <div className="flex gap-2 flex-wrap">
                {(["all", "song", "album", "video", "artist"] as (string)[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t as any)}
                    className={`px-3 py-1 rounded-md text-sm border ${type === t ? "bg-slate-900 text-white border-transparent" : "bg-transparent text-slate-600 border-slate-200 dark:border-slate-700 dark:text-slate-300"}`}
                  >
                    {t === "all" ? "All" : t[0].toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Genre</h4>
                  <select
                    aria-label="genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="mt-2 w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-900 text-sm"
                  >
                    <option>All</option>
                    <option>Hip Hop</option>
                    <option>Afro Pop</option>
                    <option>RnB</option>
                    <option>Gospel</option>
                    <option>Dancehall</option>
                    <option>Pop</option>
                  </select>
                </div>

                <div className="w-32">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sort</h4>
                  <select
                    aria-label="sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="mt-2 w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-900 text-sm"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="newest">Newest</option>
                    <option value="popular">Popular</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => { setPage(1); fetchPage(query, type === "all" ? undefined : (type as ResultType), genre === "All" ? undefined : genre, sort, 1, limit, false); }}>
                  Search
                </Button>
                <button
                  onClick={() => { setQuery(""); setResults([]); setSuggestions([]); setTotal(0); }}
                  className="ml-auto text-sm px-3 py-2 rounded-md border bg-transparent"
                >
                  Reset
                </button>
              </div>
            </motion.div>

            <div className="hidden sm:block bg-white dark:bg-slate-800 rounded-xl p-4 shadow">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tips</h4>
              <ul className="text-xs text-gray-500 mt-2 space-y-1">
                <li>Use &quot;artist:Name&quot; to narrow by artist (if supported).</li>
                <li>Try genre + keywords: <span className="font-medium">hip hop summer</span></li>
                <li>Keyboard: arrow keys for suggestions, Enter to select.</li>
              </ul>
            </div>
          </div>

          {/* Right: results */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Search</h2>
                <p className="text-sm text-gray-500">{total ? `${total.toLocaleString()} results` : "Enter a query to begin"}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-500 hidden sm:block">Type: <strong className="ml-1">{type}</strong></div>
                <div className="text-sm text-gray-500 hidden sm:block">Genre: <strong className="ml-1">{genre}</strong></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {loading && results.length === 0
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                  : results.map((r) => <ResultCard item={r} key={`${r.type}-${r.id}`} />)}
              </AnimatePresence>
            </div>

            <div ref={loaderRef} className="h-12 flex items-center justify-center mt-6">
              {loading ? (
                <span className="text-gray-500">Loading...</span>
              ) : results.length < total ? (
                <span className="text-gray-500">Scroll to load more…</span>
              ) : (
                <span className="text-gray-400">End of results</span>
              )}
            </div>

            {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
          </div>
        </div>
      </section>
    </main>
  );
}
