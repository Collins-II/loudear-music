"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  JSX,
} from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X as XIcon,
  ArrowRight,
  PlayCircle,
  Music2,
  Disc,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
/* ---------------------------
   Types
----------------------------*/
type ResultType = "song" | "album" | "video"
type SortOption = "relevance" | "newest" | "popular";

interface SearchResultBase {
  id: string;
  type: ResultType;
  title: string;
  subtitle?: string;
  image?: string;
  genre?: string;
  releaseDate?: string;
  stats?: {
    plays?: number;
    views?: number;
    downloads?: number;
    likes?: number;
  };
  extra?: {
    previewUrl?: string; // small mp4/mp3 preview url (optional)
  };
}

interface SearchResponse {
  results: SearchResultBase[];
  total: number;
  page: number;
  limit: number;
}

interface TrendingItem {
  id: string;
  title: string;
  artist?: string;
  cover?: string;
  rank: number;
  score?: number;
}

/* ---------------------------
   Constants & Utilities
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

/* ---------------------------
   Small UI: result tile with hover preview
----------------------------*/
const IconForType = ({ t }: { t: ResultType }) => {
  if (t === "song") return <Music2 size={14} />;
  if (t === "album") return <Disc size={14} />;
  if (t === "video") return <Video size={14} />;
};

function PreviewLayer({
  previewUrl,
  playing,
}: {
  previewUrl?: string;
  playing: boolean;
}) {
  // show a muted, looped small video if available, otherwise nothing
  if (!previewUrl) return null;
  return (
    <video
      src={previewUrl}
      className="absolute inset-0 w-full h-full object-cover rounded-lg"
      muted
      playsInline
      autoPlay={playing}
      loop
      aria-hidden
    />
  );
}

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 shadow">
      {/* shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />

      {/* thumbnail */}
      <div className="w-full h-56 md:h-48 lg:h-56 bg-gray-200 dark:bg-neutral-800" />

      {/* content placeholders */}
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-neutral-800 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 dark:bg-neutral-800 rounded" />
        <div className="h-3 w-full bg-gray-200 dark:bg-neutral-800 rounded" />
      </div>
    </div>
  );
}


function ResultTile({ item, rank }: { item: SearchResultBase; rank?: number }) {
  const [hover, setHover] = useState(false);
  const [playingPreview, setPlayingPreview] = useState(false);
  useEffect(() => {
    // when hover state changes, set playingPreview briefly after hover to avoid immediate buffering
    let t: number | undefined;
    if (hover && item.extra?.previewUrl) {
      t = window.setTimeout(() => setPlayingPreview(true), 180);
    } else {
      setPlayingPreview(false);
    }
    return () => {
      if (t) window.clearTimeout(t);
    };
  }, [hover, item.extra?.previewUrl]);

  return (
    <motion.article
      layout
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="relative rounded-2xl bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 overflow-hidden shadow hover:shadow-lg transition"
    >
      <div className="relative w-full h-56 md:h-48 lg:h-56">
        {/* image / preview container */}
        {item.extra?.previewUrl && hover ? (
          <div className="absolute inset-0">
            <PreviewLayer previewUrl={item.extra.previewUrl} playing={playingPreview} />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <PlayCircle className="text-white" size={48} />
            </div>
          </div>
        ) : item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <IconForType t={item.type} />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm md:text-base font-semibold text-slate-900 dark:text-white truncate">
              {rank ? `#${rank} ${item.title}` : item.title}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {item.subtitle ?? (item.type === "song" ? "Song" : item.type)}
            </div>
          </div>

          <div className="text-right text-xs text-gray-400">
            {item.releaseDate ? new Date(item.releaseDate).getFullYear() : ""}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {item.genre && (
              <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-xs">
                {item.genre}
              </span>
            )}
            {item.stats?.plays !== undefined && (
              <span>{item.stats.plays.toLocaleString()} plays</span>
            )}
          </div>

          <a
            href={`/view/${item.type}/${item.id}`}
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium"
            aria-label={`Open ${item.title}`}
          >
            Open <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

/* ---------------------------
   Trending leaderboard visual
----------------------------*/
function TrendingLeaderboard({ list }: { list: TrendingItem[] }) {
  return (
    <section className="rounded-2xl bg-gradient-to-r from-pink-600 via-red-500 to-orange-400 text-white p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold">Top Trending</h3>
        <div className="text-xs opacity-90">Updated weekly</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <div className="text-sm font-semibold truncate">{t.title}</div>
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
   Main Page Component
----------------------------*/
export default function InteractiveSearchPage(): JSX.Element {
  // query & filters
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 350);

  const [type, setType] = useState<"all" | ResultType>("all");
  const [genre, setGenre] = useState<string>("All");
  const [sort, setSort] = useState<SortOption>("relevance");

  // results / paging
  const [results, setResults] = useState<SearchResultBase[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  // trending
  const [trending, setTrending] = useState<TrendingItem[]>([]);

  // refs
  const abortRef = useRef<AbortController | null>(null);
  const suggestAbortRef = useRef<AbortController | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // preview audio/video focus lock (only one preview plays)
  //const [previewPlayingId, setPreviewPlayingId] = useState<string | null>(null);

  /* fetch trending once */
/* fetch trending once */
useEffect(() => {
  const ctrl = new AbortController();

  fetch("/api/trending?limit=6", {
    signal: ctrl.signal,
    cache: "no-store",
  })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
    .then((body: { items: TrendingItem[] }) => {
      setTrending(body.items ?? []);
    })
    .catch((err) => {
      console.warn("Failed to fetch trending:", err);
    });

  return () => ctrl.abort();
}, []);

  /* Fetch suggestions */
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      setActiveSuggestion(-1);
      return;
    }
    suggestAbortRef.current?.abort();
    const ctrl = new AbortController();
    suggestAbortRef.current = ctrl;
    fetch(`/api/search/suggest?q=${encodeURIComponent(debouncedQuery)}`, {
      signal: ctrl.signal,
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((body: { suggestions?: string[] }) => {
        setSuggestions((body.suggestions ?? []).slice(0, 6));
      })
      .catch(() => {})
      .finally(() => {});
    return () => ctrl.abort();
  }, [debouncedQuery]);

  /* Fetch page */
  const fetchPage = useCallback(
    async (opts: { q?: string; p?: number; append?: boolean } = {}) => {
      const q = opts.q ?? debouncedQuery;
      const p = opts.p ?? 1;
      const append = Boolean(opts.append);
      if (!q || q.trim().length === 0) {
        setResults([]);
        setTotal(0);
        return;
      }

      setLoading(true);
      setError(null);
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      const params = new URLSearchParams({
        q: q.trim(),
        type: type === "all" ? "" : type,
        genre: genre === "All" ? "" : genre,
        sort,
        page: String(p),
        limit: String(DEFAULT_LIMIT),
      });

      try {
        const res = await fetch(`/api/search?${params.toString()}`, {
          signal: ctrl.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const body = (await res.json()) as SearchResponse;
        setTotal(body.total ?? 0);
        setPage(body.page ?? p);
        setResults((prev) => (append ? [...prev, ...(body.results ?? [])] : body.results ?? []));
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Search error", err);
          setError(err.message ?? "Search failed");
        }
      } finally {
        setLoading(false);
      }
    },
    [debouncedQuery, type, genre, sort]
  );

  /* main effect: run search when debouncedQuery or filters change */
  useEffect(() => {
    setPage(1);
    fetchPage({ q: debouncedQuery, p: 1, append: false });
  }, [debouncedQuery, type, genre, sort, fetchPage]);

  /* infinite scroll observer */
  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && results.length < total) {
          fetchPage({ q: debouncedQuery, p: page + 1, append: true });
        }
      },
      { threshold: 1 }
    );
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [loaderRef, loading, results.length, total, page, fetchPage, debouncedQuery]);

  /* keyboard nav for suggestions */
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
        }
      } else if (e.key === "Escape") {
        setSuggestions([]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [suggestions, activeSuggestion]);

  /* UI helpers */
  const handleSelectSuggestion = (s: string) => {
    setQuery(s);
    setSuggestions([]);
  };

  const clear = () => {
    setQuery("");
    setSuggestions([]);
    setResults([]);
    setTotal(0);
  };

  /* render */
  return (
    <main className="min-h-screen bg-white pt-12">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header / Search */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-black">LoudEar Search</h1>
              <p className="text-sm text-gray-500 mt-1">Discover songs, albums, videos and artists — interactive previews included.</p>
            </div>

            <div className="w-full md:w-2/5">
               <motion.form               
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`w-full border rounded-full px-3 py-2 flex items-center gap-2 bg-black/90 text-white border-black"
                  }`}
                               >
                  <input
                    type="text"
                    placeholder="Search tracks, videos, artists..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                    className={`flex-1 px-4 py-1 text-sm rounded-full border-none focus:ring-2 transition-colors duration-200 bg-black/50 text-white placeholder-white/60 focus:ring-blue-400 focus:outline-none`}
                  />
                  {query ? (
                  <Button onClick={clear} size="sm" className="bg-white text-black rounded-full">
                    <XIcon />
                  </Button>
                  ) : null}
                
                 </motion.form>

              {/* suggestion dropdown */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mt-2 bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-xl shadow-lg overflow-hidden text-sm"
                  >
                    {suggestions.map((s, i) => (
                      <li
                        key={s}
                        onMouseDown={(ev) => {
                          ev.preventDefault();
                          handleSelectSuggestion(s);
                        }}
                        className={`px-4 py-2 cursor-pointer ${i === activeSuggestion ? "bg-gray-100 dark:bg-neutral-800" : "hover:bg-gray-50 dark:hover:bg-neutral-800"}`}
                      >
                        {s}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* filters row */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            {(["all", "song", "album", "video"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1 rounded-full text-sm border ${type === t ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-200 border-black/5 dark:border-white/5"}`}
                //aria-pressed={type === t ? "true" : "false"}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}

            <select aria-label="select-button" value={genre} onChange={(e) => setGenre(e.target.value)} className="ml-auto rounded-full px-3 py-1 border bg-white dark:bg-neutral-900 text-sm text-black/80">
              <option>All</option>
              <option>Hip Hop</option>
              <option>Pop</option>
              <option>Afrobeat</option>
              <option>RnB</option>
              <option>Gospel</option>
            </select>

            <select aria-label="select-button" value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="rounded-full px-3 py-1 border bg-white dark:bg-neutral-900 text-sm text-black/80">
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>

        {/* Trending + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Trending (left/above on large) */}
          <div className="lg:col-span-4">
            <TrendingLeaderboard list={trending} />
            <div className="mt-6 bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-2xl p-4">
              <h4 className="font-semibold mb-2">Chart Tips</h4>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>Try filters like <span className="font-medium">genre:Hip Hop</span></li>
                <li>Use <span className="font-medium">artist:Name</span> to narrow results</li>
              </ul>
            </div>
          </div>

          {/* Grid results */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Interactive Grid</h2>
                <p className="text-sm text-gray-500">{total ? `${total.toLocaleString()} results` : debouncedQuery ? "No results" : "Start typing to search"}</p>
              </div>

              <div className="flex items-center font-semibold gap-2 text-sm text-gray-700">
                <div className="hidden sm:block">Type: <strong className="ml-1">{type}</strong></div>
                <div className="hidden sm:block">Genre: <strong className="ml-1">{genre}</strong></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence>
                {loading && results.length === 0
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                  : results.map((r, idx) => (
                      <ResultTile key={`${r.type}-${r.id}`} item={r} rank={idx + 1} />
                    ))}
              </AnimatePresence>
            </div>

            <div ref={loaderRef} className="h-16 flex items-center justify-center mt-8 text-sm text-gray-500">
              {loading ? "Loading..." : results.length < total ? "Scroll to load more…" : total > 0 ? "End of results" : ""}
            </div>

            {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------------------------
   Optional fallback for Button/Badge imports
   If your project doesn't have these components, you can
   replace imports near the top with simple components:
   const Button = ({ children, ...p }) => <button {...p}>{children}</button>;
   const Badge = (...) => <span className="...">{children}</span>;
----------------------------*/
