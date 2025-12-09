"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChartRow } from "@/components/music/ChartRow";
import { DropdownRadio } from "@/components/DropdownRadio";
import { getCharts, ChartItem, getTrending } from "@/actions/getCharts";
import { ChartCard } from "@/components/music/ChartCard";
import { getSocket } from "@/lib/socketClient";
import { TopVideoCard } from "@/components/video/TopVideoCard";
import SkeletonList from "@/components/skeletons/skeleton-list";
import ChartCardSkeleton from "@/components/skeletons/chart-card-skeleton";
import { TrendingItem } from "@/app/search/components/IndexSearch";
import TopCardSkeleton from "@/components/skeletons/top-card-skeleton";
import ThemedHeading from "@/components/themed-heading";
import { TopRecordsBoard } from "@/components/analytics/TopRecords";

/* ---------------------------------- Filters ---------------------------------- */
const genres = ["All", "Hip Hop", "Afro Pop", "Gospel", "RnB", "Dancehall"];
const alphabet = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"] as const;

type ViewMode = "grid" | "chart";
type Category = "songs" | "albums" | "videos";
type Sort = "this-week" | "last-week" | "all-time";
type FilterType = "latest" | "trending" | "a-z" | "genre";

export default function ChartsPageWrapper() {
  const [initialData, setInitialData] = useState<ChartItem[]>([]);
  const [top10Videos, setTop10Videos] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitial() {
      try {
        const charts = await getCharts({
          category: "songs",
          region: "global",
          sort: "all-time",
          limit: 50,
        });

        const trendingVideos = await getTrending({
          model: "Video",
          limit: 10,
          sinceDays: 30,
        });

        // Normalize trending videos
        const videos: ChartItem[] = trendingVideos.map((v: any) => ({
          id: String(v._id),
          title: v.title,
          artist: v.artist ?? "",
          image: v.coverUrl ?? "",
          videoUrl: v.videoUrl,
          position: v.position,
          lastWeek: null,
          peak: v.peak,
          weeksOn: v.weeksOn,
          region: "global",
          genre: v.genre ?? "Unknown",
          releaseDate: v.releaseDate,
          stats: {
            weeklyViews: v.stats?.weeklyViews,
            totalViews: v.stats?.totalViews,
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
        console.error("Error loading charts:", err);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ChartCardSkeleton key={i} />
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

  return <ChartsPage initialData={initialData} topVideos={top10Videos} />;
}

/* -------------------------------------------------------------------------- */
/*                             Main Charts Page                               */
/* -------------------------------------------------------------------------- */

function ChartsPage({
  initialData,
  topVideos,
}: {
  initialData: ChartItem[];
  topVideos: ChartItem[];
}) {
  const [filters, setFilters] = useState({
    filter: "latest" as FilterType,
    genre: "All",
    letter: "All",
    category: "songs" as Category,
    region: "global",
    sort: "this-week" as Sort,
    view: "grid" as ViewMode,
  });

  const socket = getSocket();
  const [charts, setCharts] = useState<ChartItem[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState<TrendingItem[]>([]);

  const itemsPerPage = 9;
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);
  const loaderRef = useRef<HTMLDivElement | null>(null);

   /* 🧠 Fetch trending */
    useEffect(() => {
      setLoading(true);
      fetch("/api/trending/global?limit=6")
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) => setTrending(data.items || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, []);

  /* --- Fetch charts on category/sort change --- */
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



  /* --- Filtering logic --- */
  const filteredCharts = useMemo(() => {
    let list = [...charts];

    if (filters.filter === "genre" && filters.genre !== "All") {
      list = list.filter(
        (item) => item.genre?.toLowerCase() === filters.genre.toLowerCase()
      );
    }

    if (filters.filter === "a-z" && filters.letter !== "All") {
      list = list
        .filter((item) => {
          const firstCharTitle = item.title?.[0]?.toUpperCase() ?? "";
          const firstCharArtist = item.artist?.[0]?.toUpperCase() ?? "";
          return (
            firstCharTitle === filters.letter || firstCharArtist === filters.letter
          );
        })
        .sort((a, b) => a.title.localeCompare(b.title));
    }

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

  const cardUrl = filters.category === "songs" ? "song" : "album";

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
              Music Charts
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
              {(["songs", "albums", "videos"] as const).map((cat) => (
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
              <DropdownRadio
                actionLabel="A-Z"
                label="By Alphabet"
                data={alphabet as unknown as string[]}
                onChange={(val) =>
                  setFilters((f) => ({ ...f, letter: val, filter: "a-z" }))
                }
              />

              <DropdownRadio
                actionLabel="Genre"
                label="Select Genre"
                data={genres}
                onChange={(val) =>
                  setFilters((f) => ({ ...f, genre: val, filter: "genre" }))
                }
              />

              <DropdownRadio
                actionLabel="Sort"
                label="Select"
                data={["latest", "trending"]}
                onChange={(val) =>
                  setFilters((f) => ({ ...f, filter: val as FilterType }))
                }
              />

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
      <section className="max-w-7xl mx-auto px-6 xl:px-0 py-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Main */}
        <div className="lg:col-span-3">
          {loading ? (
            filters.view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ChartCardSkeleton key={i} />
              ))}
            </div>

            ) : (
              <SkeletonList count={10} />
            )
          ) : filters.view === "chart" ? (
            <div className="space-y-4">
              <ThemedHeading>
                {`Top ${filters.category} (${filters.sort.replace("-", " ")})`}
              </ThemedHeading>

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
            <ThemedHeading>
              {filters.filter === "a-z"
                    ? "Browse A–Z"
                    : `${filters.filter} ${filters.category}`}
            </ThemedHeading>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredCharts.slice(0, visibleItems).map((item, idx) => (
                  <ChartCard
                    key={idx}
                    id={item.id}
                    href={`/music/${cardUrl}/${item.id}`}
                    title={item.title}
                    artist={item.artist ?? ""}
                    cover={item.image}
                    isTrending={item.position <= 10}
                    rank={item.position}
                    peak={item.peak as number}
                    weeksOn={item.weeksOn}
                  />
                ))}
              </div>

              <div ref={loaderRef} className="h-12 flex justify-center items-center">
                {visibleItems < filteredCharts.length && (
                  <span className="text-gray-500">Loading more...</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-12">
          <TopRecordsBoard list={trending} loading={loading} />

          <div>
              <ThemedHeading>
                Top 10 Videos
              </ThemedHeading>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1">
              {topVideos.map((track, index) => (
                <TopVideoCard
                  key={index}
                  position={track.position}
                  id={track.id}
                  title={track.title}
                  curator={track.artist ?? ""}
                  href={`/videos/${track.id}`}
                  thumbnail={track.image}
                  videoUrl={track.videoUrl as string}
                  genre={track.genre}
                  views={track.stats.totalViews}
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