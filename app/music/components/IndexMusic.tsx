"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

import { ChartRow } from "@/components/music/ChartRow";
import { DropdownRadio } from "@/components/DropdownRadio";
import { getCharts, ChartItem, getTrending } from "@/actions/getCharts";
import { getSocket } from "@/lib/socketClient";
import { useMemo } from "react";
import { MusicCard } from "@/components/music/MusicCard";
import { TopSongCard } from "@/components/music/TopSongsCard";

// --- Filters ---
const genres = ["All", "Hip Hop", "Afro Pop", "Gospel", "RnB", "Dancehall"];
const alphabet = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"] as const;

type ViewMode = "grid" | "chart";
type Category = "songs" | "albums" | "videos";
type Sort = "this-week" | "last-week" | "all-time";
type FilterType = "latest" | "trending" | "a-z" | "genre";

export default function IndexMusicWrapper() {
  const [initialData, setInitialData] = useState<ChartItem[]>([]);
  const [top10Videos, setTop10Videos] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitial() {
      try {
        const charts = await getCharts({
          category: "songs",
          region: "global",
          sort: "this-week",
          limit: 50,
        });

        const trendingVideos = await getTrending({
          model: "Song",
          limit: 10,
          sinceDays: 30,
        });

        // 🔑 Normalize trending videos into ChartItem shape
        const videos: ChartItem[] = trendingVideos.map((v: any, idx: number) => ({
          id: String(v._id),
          title: v.title,
          artist: v.artist ?? "",
          image: v.coverUrl ?? "",
          videoUrl: v.videoUrl,
          position: idx + 1,
          lastWeek: null,
          peak: idx + 1,
          weeksOn: 1,
          region: "global",
          genre: v.genre ?? "Unknown",
          releaseDate: v.releaseDate,
          stats: {
            plays: v.viewCount ?? 0,
            downloads: v.downloadCount ?? 0,
            likes: v.likeCount ?? 0,
            views: v.viewCount ?? 0,
            shares: v.shareCount ?? 0,
            comments: v.commentCount ?? 0,
          },
        }));

        setTop10Videos(videos);
        setInitialData(charts);
      } catch (err) {
        console.error("Error loading initial charts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  if (loading) {
    return (
      <main className="flex items-center justify-center h-screen">
        <span className="text-gray-500 text-lg">Loading music...</span>
      </main>
    );
  }

  return <IndexMusic initialData={initialData} topVideos={top10Videos} />;
}

function IndexMusic({ initialData, topVideos }: { initialData: ChartItem[], topVideos: ChartItem[] }) {
  const [filters, setFilters] = useState<{
    filter: FilterType;
    genre: string;
    letter: string;
    category: Category;
    region: string;
    sort: Sort;
    view: ViewMode;
  }>({
    filter: "latest",
    genre: "All",
    letter: "All",
    category: "songs",
    region: "global",
    sort: "this-week",
    view: "grid",
  });

  const socket = getSocket();
  const [charts, setCharts] = useState<ChartItem[]>(initialData);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 9;
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // --- Fetch charts when category/sort/region changes ---
  useEffect(() => {
    async function fetchCharts() {
      setLoading(true);
      try {
        const data = await getCharts({
          category: filters.category,
          region: filters.region,
          sort: filters.sort,
          limit: 100,
        });
        setCharts(data);
      } catch (err) {
        console.error("Failed to fetch charts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCharts();
  }, [filters.category, filters.region, filters.sort]);

  useEffect(() => {
  socket.on("charts:update:category", (payload) => {
    if (payload.category === filters.category) {
      setCharts(payload.items);
    }
  });

  return () => {
    socket.off("charts:update");
  };
}, [filters.category,socket]);



const filteredCharts = useMemo(() => {
  let list = [...charts]; // copy so we don't mutate state

  // --- Genre filter ---
  if (filters.filter === "genre" && filters.genre !== "All") {
    list = list.filter(
      (item) => item.genre?.toLowerCase() === filters.genre.toLowerCase()
    );
  }

  // --- Alphabet filter ---
  if (filters.filter === "a-z" && filters.letter !== "All") {
    list = list.filter((item) => {
      const firstCharTitle = item.title?.[0]?.toUpperCase() ?? "";
      const firstCharArtist = item.artist?.[0]?.toUpperCase() ?? "";
      return firstCharTitle === filters.letter || firstCharArtist === filters.letter;
    });
    list.sort((a, b) => a.title.localeCompare(b.title));
  }

  // --- Latest filter ---
  if (filters.filter === "latest") {
    list = list
      .filter((item) => {
        const release = new Date(item.releaseDate ?? "");
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        return release >= twoWeeksAgo;
      })
      .sort(
        (a, b) =>
          new Date(b.releaseDate ?? "").getTime() -
          new Date(a.releaseDate ?? "").getTime()
      );
  }

  // --- Trending filter ---
  if (filters.filter === "trending") {
    list = list
      .filter((item) => item.position && item.position <= 10)
      .sort((a, b) => a.position - b.position);
  }

  return list;
}, [charts, filters]);


  useEffect(() => setVisibleItems(itemsPerPage), [filters]);

  useEffect(() => {
  if (filters.view === "grid") return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        setVisibleItems((prev) =>
          Math.min(prev + itemsPerPage, filteredCharts.length)
        );
      }
    },
    { threshold: 1 }
  );

  const current = loaderRef.current;
  if (current) observer.observe(current);

  return () => {
    if (current) observer.unobserve(current);
  };
}, [filteredCharts, filters.view]);


  const cardUrl = filters.category === "songs"? "song" : "album" 

  const clearFilters = () =>
    setFilters({
      filter: "latest",
      genre: "All",
      letter: "All",
      category: "songs",
      region: "global",
      sort: "this-week",
      view: "chart",
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
              Explore Music
            </motion.h1>

            {/* View toggle */}
            <div className="mt-6 flex gap-3">
              <Button
                variant={filters.view === "grid" ? "secondary" : "default"}
                onClick={() => setFilters((f) => ({ ...f, view: "grid" }))}
              >
                Grid View
              </Button>
              <Button
                variant={filters.view === "chart" ? "secondary" : "default"}
                onClick={() => setFilters((f) => ({ ...f, view: "chart" }))}
              >
                Weekly Chart
              </Button>
            </div>
          </div>

          {/* Filters */}
          <section className="flex flex-col flex-wrap gap-6 items-start lg:items-end justify-center">
            <div className="flex gap-6 text-lg font-bold">
              {(["songs", "albums"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilters((f) => ({ ...f, category: cat }))}
                  className={`capitalize border-b-4 ${
                    filters.category === cat
                      ? "border-slate-100 text-slate-100"
                      : "border-transparent hover:border-white hover:text-gray-300"
                  } pb-1 transition`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap w-full items-center justify-start gap-4">
              {/* A–Z filter */}
              <DropdownRadio
                actionLabel="A-Z"
                label="By Alphabet"
                data={alphabet as unknown as string[]}
                onChange={(val) =>
                  setFilters((f) => ({ ...f, letter: val, filter: "a-z" }))
                }
              />

              {/* Genre filter */}
              <DropdownRadio
                actionLabel="Genre"
                label="Select Genre"
                data={genres}
                onChange={(val) =>
                  setFilters((f) => ({ ...f, genre: val, filter: "genre" }))
                }
              />

              {/* Sort filter */}
              <DropdownRadio
                actionLabel="Sort"
                label="Select"
                data={["latest", "trending"]}
                onChange={(val) =>
                  setFilters((f) => ({ ...f, filter: val as FilterType }))
                }
              />

               {/* Sort filter */}
              <DropdownRadio
                actionLabel="By Weeks"
                label="Select"
                data={["all-time", "this-week", "last-week"]}
                onChange={(val) =>
                  setFilters((f) => ({ ...f, sort: val as Sort }))
                }
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
            <div className="text-gray-500">Refreshing charts...</div>
          ) : filters.view === "chart" ? (
            <div className="space-y-4">
              <h3 className="relative text-slate-900 text-2xl font-extrabold mb-6 tracking-tight">
                <span className="relative z-10 bg-white capitalize pr-3">
                  {`Top ${filters.category} (${filters.sort.replace("-", " ")})`}
                </span>
                <span className="absolute left-0 top-1/2 w-full h-[8px] bg-black -z-0"></span>
              </h3>

              <div className="divide-y">
                {charts.map((item) => (
                  <ChartRow
                    key={item.id}
                    idx={item.position}
                    title={item.title}
                    artist={item.artist ?? ""}
                    href={`/charts/${filters.category}/${item.id}`}
                    cover={item.image}
                    thisWeek={item.position}
                    lastWeek={item.lastWeek ?? 0}
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              <h3 className="relative text-slate-900 text-2xl font-extrabold mb-6 tracking-tight">
                <span className="relative z-10 bg-white pr-3 capitalize">
                  {filters.filter === "a-z"
                    ? "Browse A–Z"
                    : `${filters.filter} ${filters.category}`}
                </span>
                <span className="absolute left-0 top-1/2 w-full h-[8px] bg-black -z-0"></span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredCharts.slice(0, visibleItems).map((item, idx) => (
                  <MusicCard
                    key={idx}
                    id={item.id}
                    href={`/music/${cardUrl}/${item.id}`}
                    title={item.title}
                    artist={item.artist ?? ""}
                    cover={item.image}
                    isTrending={item.position <= 10}
                    genre={item.genre}
                    downloads={item.stats.downloads}
                    views={item.stats.views}
                    publishedAt={item.releaseDate}
                  />
                ))}
              </div>

              <div
                ref={loaderRef}
                className="h-12 flex justify-center items-center"
              >
                {visibleItems < filteredCharts.length && (
                  <span className="text-gray-500">Loading more...</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-12">
          <div className="rounded-xl overflow-hidden shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
            <h4 className="text-xl font-bold">🔥 Summer Hits 2025</h4>
            <p className="text-sm mt-2">The hottest tracks for your vibe</p>
            <Button className="mt-4 bg-white text-black hover:bg-gray-200">
              Listen Now
            </Button>
          </div>

          <div>
            <h3 className="relative text-slate-900 text-2xl font-extrabold mb-6 tracking-tight">
              <span className="relative z-10 bg-white pr-3">Top 10 Songs</span>
              <span className="absolute left-0 top-1/2 w-full h-[8px] bg-black -z-0"></span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1">
              {topVideos.map((track, index) => (
                <TopSongCard
                  key={index}
                  position={track.position}
                  id={track.id}
                  title={track.title}
                  curator={track.artist ?? ""}
                  href={`/music/song/${track.id}`}
                  thumbnail={track.image}
                  videoUrl={track.videoUrl as string}
                  genre={track.genre} // correctly using genre now
                  views={track.stats.views}
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
