"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { CardContent } from "@/components/ui/card";
import { timeAgo } from "@/lib/utils";
import { blogPosts } from "@/data/blogPosts";

// Dummy blog data

export default function BlogSection() {
  return (
    <section className="pb-16 px-6 md:px-12 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
          <h3 className="relative text-slate-900 text-2xl md:text-3xl font-extrabold mb-6 tracking-tight">
              <span className="relative z-10 bg-white pr-3">The Magazine</span>
              <span className="absolute left-0 top-1/2 w-full h-[8px] bg-black -z-0"></span>
           </h3>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Featured Hero Post */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2"
          >
            <Link href={`/blog/${blogPosts[0].id}`}>
              <div className="overflow-hidden transition">
                <div className="relative h-80 w-full">
                  <Image
                    src={blogPosts[0].image}
                    alt={blogPosts[0].title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute -bottom-3 right-[50%] md:-bottom-4 md:right-[50%] bg-primary text-white text-[10px] md:text-xs px-2 md:px-4 py-0.5 md:py-1 shadow-lg whitespace-nowrap">
                    <h3 className="text-white text-1xl md:text-2xl font-bold tracking-tight">
                      Top Story
                    </h3>
                  </div>
                </div>
                <CardContent className="flex flex-col justify-center items-center px-2 md:px-6 py-6 space-y-3">
                  <h3 className="text-black text-4xl font-extrabold">{blogPosts[0].title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {blogPosts[0].excerpt}
                  </p>
                  <p className="text-xs text-gray-500">
                    {blogPosts[0].date.toLocaleDateString()} · {blogPosts[0].author}
                  </p>
                </CardContent>
              </div>
            </Link>
          </motion.div>

          {/* Side Posts */}
          <div className="flex flex-col gap-6">
            {/* Section Header */}
          <h3 className="relative text-slate-900 text-2xl md:text-3xl font-extrabold mb-6 tracking-tight">
              <span className="relative z-10 bg-white pr-3">Latest News</span>
              <span className="absolute left-0 top-1/2 w-full h-[8px] bg-black -z-0"></span>
           </h3>

            {blogPosts.slice(1, 3).map((post) => (
              <motion.div
                key={post.id}
                initial={{ x: 30, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Link href={`/blog/${post.id}`}>
                  <div className="flex flex-row gap-2 overflow-hidden transition">
                    <div className="relative w-32 h-20 flex-shrink-0">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="pb-2 space-y-1">
                      <h4 className="text-black text-xl md:text-2xl font-bold line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-xs text-gray-500">{timeAgo(post.date)}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            <div className="flex items-center justify-end my-6">
              <motion.a href="/blog" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <div className="relative flex items-center gap-2 text-md capitalize font-bold text-black tracking-wide w-fit">
                  <span className="relative z-10 pb-1 capitalize">See More</span>
                  <span className="absolute left-0 bottom-0 w-full h-[2px] bg-black"></span>
               </div>
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom Grid of more posts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          {blogPosts.slice(1).map((post) => (
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
      </div>
    </section>
  );
}
