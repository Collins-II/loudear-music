"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { CardContent } from "@/components/ui/card";
import { timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DropdownRadio } from "@/components/DropdownRadio";
import { CalendarFilter } from "@/components/CalenderFilter";

// Dummy blog data with real Date objects
export const blogPosts = [
  {
    id: 1,
    title: "Cleo Ice Queen Drops New Single ‘Power’",
    excerpt: "The hip hop queen returns with a bold anthem set to dominate the charts this Friday.",
    image: "/assets/images/cleo-blog01.jpg",
    date: new Date("2025-09-05"),
    author: "LoudEar Editorial",
    category: "HIP HOP",
  },
  {
    id: 2,
    title: "Top 10 Rising African Artists to Watch",
    excerpt: "From Afrobeat to Hip Hop, here are the hottest acts shaping the future of music.",
    image: "/assets/images/yomaps-03.jpg",
    date: new Date("2025-09-03"),
    author: "LoudEar Team",
    category: "SPOTLIGHT",
  },
  {
    id: 3,
    title: "Inside the Studio: Rich Bizzy’s Creative Process",
    excerpt: "Go behind the scenes with one of Zambia’s most celebrated hitmakers.",
    image: "/assets/images/bizzy07.jpg",
    date: new Date("2025-09-01"),
    author: "LoudEar Features",
    category: "FEATURES",
  },
  {
    id: 4,
    title: "Global Chart Movers of the Week",
    excerpt: "Discover the tracks that climbed fastest across the world in this week’s charts.",
    image: "/assets/images/yomaps-03.jpg",
    date: new Date("2025-08-30"),
    author: "Charts Desk",
    category: "CHARTS",
  },
  {
    id: 5,
    title: "Friday’s Power Acts You Need to Hear",
    excerpt: "These artists are redefining the sound of the weekend with fresh drops.",
    image: "/assets/images/yomaps-01.jpg",
    date: new Date("2025-08-28"),
    author: "Editorial Picks",
    category: "NEW MUSIC",
  },
  {
    id: 6,
    title: "Zambia’s Afrobeats Stars Shining Globally",
    excerpt: "The Afrobeats wave is putting Zambia on the world map with chart-ready bangers.",
    image: "/assets/images/cleo-03.jpg",
    date: new Date("2025-08-25"),
    author: "World Beats",
    category: "AFROBEATS",
  },
];

const genres = ["All", "HIP HOP", "SPOTLIGHT", "FEATURES", "CHARTS", "NEW MUSIC", "AFROBEATS"];

export default function BlogPage() {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

const clearFilters = () => {
    setSelectedGenre("All");
    setSelectedDate(undefined);
  };

  // Filter logic
  const filteredPosts = blogPosts.filter((post) => {
    const genreMatch = selectedGenre === "All" || post.category === selectedGenre;
    const dateMatch = selectedDate
      ? post.date.toDateString() === selectedDate.toDateString()
      : true;
    return genreMatch && dateMatch;
  });

  // Featured + remaining posts
  const featuredPost = filteredPosts[0];
  const mainPosts = filteredPosts.slice(1);
  const trendingPosts = blogPosts.slice(0, 4);

  return (
    <section className="bg-background min-h-screen">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-black via-gray-900 to-black text-white pt-24 pb-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-10 gap-6">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-blue-500 text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            Blog
          </motion.h1>

          {/* Filters */}
          <div className="flex gap-4 flex-wrap items-center justify-center">
            <CalendarFilter onChange={(val) => setSelectedDate(val)} />
            <DropdownRadio
              actionLabel="Genre"
              label="Select Genre"
              data={genres}
              onChange={(val) => setSelectedGenre(val)}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={clearFilters}
              className="ml-2"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <h1 className="relative text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          <span className="relative z-10 bg-white pr-3">The Magazine</span>
          <span className="absolute left-0 top-1/2 w-full h-[8px] bg-black -z-0"></span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Left/Main Content */}
          <div className="lg:col-span-3 space-y-12">
            {featuredPost ? (
              <>
                {/* Featured Hero Post */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Link href={`/blog/${featuredPost.id}`}>
                    <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition">
                      <div className="relative h-[450px] w-full">
                        <Image src={featuredPost.image} alt={featuredPost.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                          <span className="bg-blue-500 text-xs px-3 py-1 rounded font-semibold">
                            {featuredPost.category}
                          </span>
                          <h2 className="text-3xl md:text-5xl font-bold mt-2">{featuredPost.title}</h2>
                          <p className="text-gray-200 mt-2 line-clamp-3">{featuredPost.excerpt}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {featuredPost.date.toDateString()} · {featuredPost.author}
                          </p>
                          <Button size="lg" className="mt-4 w-fit bg-blue-500 hover:bg-blue-600 text-white">
                            Read More
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                {/* Related Posts */}
                <h3 className="relative text-slate-900 text-2xl font-extrabold mb-6 tracking-tight">
                  <span className="relative z-10 bg-white pr-3">Related Posts</span>
                  <span className="absolute left-0 top-1/2 w-full h-[8px] bg-black -z-0"></span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {mainPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ y: 30, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Link href={`/blog/${post.id}`}>
                        <div className="overflow-hidden border-b-[4px] border-black bg-white transition relative group">
                           <div className="relative h-52 w-full">
                                <Image
                                  src={post.image}
                                  alt={blogPosts[0].title}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute -bottom-3 right-0 md:-bottom-4 md:right-0 bg-black text-white text-[10px] md:text-xs px-2 md:px-4 py-0.5 md:py-1 shadow-lg whitespace-nowrap">
                                <h3 className="text-white text-2xl font-extrabold tracking-tight">
                                  {post.category}
                                </h3>
                              </div>
                            </div>
                          <div className="py-4 space-y-2">
                            <p className="flex justify-start text-[11px] uppercase font-bold text-slate-500 tracking-wide">
                              {post.date.toLocaleDateString()} · {post.author}
                            </p>
                            <h3 className="text-black text-2xl md:text-4xl font-bold line-clamp-2">{post.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-500">No posts found for this filter.</p>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-10">
            <h3 className="relative text-slate-900 text-2xl font-extrabold mb-6 tracking-tight">
              <span className="relative z-10 bg-white pr-3">Trending Posts</span>
              <span className="absolute left-0 top-1/2 w-full h-[8px] bg-black -z-0"></span>
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {trendingPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`}>
                  <div className="flex gap-3 items-center cursor-pointer border-b border-gray-200 pb-3 group">
                    <div className="relative w-20 h-14 flex-shrink-0 rounded-l-lg overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div>
                      <h4 className="text-black text-1xl font-bold line-clamp-2">{post.title}</h4>
                      <p className="italic text-xs text-gray-600">{post.author}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="bg-gray-200 h-60 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">Advertisement</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
