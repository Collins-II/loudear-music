"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DropdownRadio } from "@/components/DropdownRadio";
import { CalendarFilter } from "@/components/CalenderFilter";
import { blogPosts } from "@/data/blogPosts";
import ThemedHeading from "@/components/themed-heading";

const genres = ["All", "HIP HOP", "SPOTLIGHT", "FEATURES", "CHARTS", "NEW MUSIC", "AFROBEATS"];

export default function BlogPage() {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const clearFilters = () => {
    setSelectedGenre("All");
    setSelectedDate(undefined);
  };

  const filteredPosts = blogPosts.filter((post) => {
    const genreMatch = selectedGenre === "All" || post.category === selectedGenre;
    const dateMatch = selectedDate
      ? post.date.toDateString() === selectedDate.toDateString()
      : true;
    return genreMatch && dateMatch;
  });

  const featuredPost = filteredPosts[0];
  const mainPosts = filteredPosts.slice(1);
  const trendingPosts = blogPosts.slice(0, 4);

  return (
    <section className="bg-background dark:bg-[#0d0d10] min-h-screen text-gray-900 dark:text-gray-100">

      {/* HERO HEADER */}
      <section
        className="
          bg-gradient-to-r from-black via-gray-900 to-black text-white
          text-white pt-24 pb-12 px-6 md:px-12
        "
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-6 pt-10">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-blue-500 text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            Blog
          </motion.h1>

          {/* FILTERS */}
          <div className="flex gap-4 flex-wrap items-center">
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

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 xl:px-0 py-16">

        {/* SECTION HEADING */}
        <ThemedHeading className="lg:text-5xl">
          The Magazine
        </ThemedHeading>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-3 space-y-12">

            {featuredPost ? (
              <>
                {/* FEATURED HERO POST */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Link href={`/blog/${featuredPost.id}`}>
                    <div
                      className="
                        relative rounded-2xl overflow-hidden 
                        shadow-lg hover:shadow-2xl transition
                        group bg-black dark:bg-gray-900
                      "
                    >
                      <div className="relative h-[450px] w-full">
                        <Image
                          src={featuredPost.image}
                          alt={featuredPost.title}
                          fill
                          className="
                            object-cover transition-transform duration-500 
                            group-hover:scale-105
                          "
                        />
                        <div
                          className="
                            absolute inset-0 bg-gradient-to-t 
                            from-black/80 to-transparent 
                            p-6 flex flex-col justify-end
                          "
                        >
                          <span className="bg-blue-500 text-xs px-3 py-1 rounded font-semibold w-fit">
                            {featuredPost.category}
                          </span>

                          <h2 className="text-3xl md:text-5xl font-bold mt-2">
                            {featuredPost.title}
                          </h2>

                          <p className="text-gray-200 mt-2 line-clamp-3">
                            {featuredPost.excerpt}
                          </p>

                          <p className="text-xs text-gray-400 mt-2">
                            {featuredPost.date.toDateString()} · {featuredPost.author}
                          </p>

                          <Button className="mt-4 w-fit bg-blue-500 hover:bg-blue-600">
                            Read More
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                {/* RELATED POSTS */}
                <ThemedHeading>
                  Related Posts
                </ThemedHeading>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {mainPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ y: 30, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Link href={`/blog/${post.id}`}>
                        <div
                          className="
                            overflow-hidden border-b-[4px] border-black dark:border-white
                            bg-white dark:bg-[#111114]
                            relative group
                          "
                        >
                          <div className="relative h-52 w-full overflow-hidden">
                            <Image
                              src={post.image}
                              alt={post.title}
                              fill
                              className="
                                object-cover transition-transform duration-500 
                                group-hover:scale-110
                              "
                            />

                            {/* Category Label */}
                            <div className="
                              absolute -bottom-3 right-0 
                              md:-bottom-4 bg-black dark:bg-white 
                              text-white dark:text-black
                              text-[10px] md:text-xs px-3 py-1
                              rounded-tl-lg shadow-lg
                            ">
                              {post.category}
                            </div>
                          </div>

                          <div className="py-4 space-y-2">
                            <p className="text-[11px] uppercase font-bold text-slate-500 dark:text-gray-400">
                              {post.date.toLocaleDateString()} · {post.author}
                            </p>
                            <h3 className="text-2xl md:text-4xl font-bold line-clamp-2 text-black dark:text-white">
                              {post.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                              {post.excerpt}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No posts found for this filter.</p>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-10">

            {/* TRENDING HEADER */}
            <ThemedHeading>
              Trending Posts
            </ThemedHeading>

            {/* TRENDING LIST */}
            <div className="grid grid-cols-1 gap-4">
              {trendingPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`}>
                  <div
                    className="
                      flex gap-3 items-center cursor-pointer 
                      border-b border-gray-300 dark:border-gray-700 
                      pb-3 group
                    "
                  >
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>

                    <div>
                      <h4 className="text-black dark:text-white text-lg font-bold line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="italic text-xs text-gray-600 dark:text-gray-400">
                        {post.author}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* ADVERTISEMENT BOX */}
            <div className="
              bg-gray-200 dark:bg-gray-800/40 
              border border-gray-300/50 dark:border-gray-700/40
              h-60 flex items-center justify-center rounded-lg
              text-gray-600 dark:text-gray-400
            ">
              Advertisement
            </div>

          </aside>
        </div>
      </div>
    </section>
  );
}
