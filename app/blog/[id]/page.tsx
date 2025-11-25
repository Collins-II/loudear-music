// Themed BlogPostPage component
// (Dark/Light theme ready using Tailwind `dark:` classes and CSS variables)

"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { blogPosts } from "@/data/blogPosts";
import ThemedHeading from "@/components/themed-heading";

// Dummy blog data
const blogPostsData = [
  {
    id: 1,
    title: "Cleo Ice Queen Drops New Single ‘Power’",
    excerpt:
      "The hip hop queen returns with a bold anthem set to dominate the charts this Friday.",
    image: "/assets/images/cleo-blog01.jpg",
    date: "Sept 5, 2025",
    author: "LoudEar Editorial",
    content: `Cleo Ice Queen makes a powerful comeback with her latest single “Power.”\nThe track blends sharp hip hop lyricism with Afrobeat rhythms, marking her boldest release to date. Fans can expect an empowering anthem.`,
  },
  {
    id: 2,
    title: "Top 10 Rising African Artists to Watch",
    excerpt:
      "From Afrobeat to Hip Hop, here are the hottest acts shaping the future of music.",
    image: "/assets/images/cleo-07.jpg",
    date: "Sept 3, 2025",
    author: "LoudEar Team",
    content: `Africa’s music scene is exploding with fresh talent across the continent.`,
  },
  {
    id: 3,
    title: "Inside the Studio: Rich Bizzy’s Creative Process",
    excerpt: "Go behind the scenes with one of Zambia’s most celebrated hitmakers.",
    image: "/assets/images/bizzy03.jpg",
    date: "Sept 1, 2025",
    author: "LoudEar Features",
    content: `A rare behind‑the‑scenes look at how hits are made by Rich Bizzy.`,
  },
];

export default function BlogPostPage() {
  const params = useParams();
  const postId = Number(params?.id);
  const post = blogPostsData.find((p) => p.id === postId);

  if (!post) {
    return (
      <main className="flex items-center justify-center h-screen bg-background text-foreground">
        <h1 className="text-2xl font-bold">Post not found</h1>
      </main>
    );
  }

  const trendingPosts = blogPostsData.slice(0, 3);

  return (
    <main className="bg-background text-foreground transition-colors">
      {/* HERO */}
      <section className="relative h-[450px] md:h-[550px] w-full overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <div className="max-w-5xl mx-auto px-6 pb-12 text-white drop-shadow-lg">
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-extrabold leading-tight"
            >
              {post.title}
            </motion.h1>
            <p className="text-gray-200 mt-2 text-lg md:text-xl">{post.excerpt}</p>
            <p className="text-gray-300 text-sm mt-1">
              {timeAgo(post.date)} · {post.author}
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT + SIDEBAR */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ARTICLE */}
        <article className="lg:col-span-2 space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          {post.content
            .trim()
            .split("\n")
            .map((para, i) => (
              <p key={i} className="text-lg md:text-xl italic opacity-90">
                {para}
              </p>
            ))}
        </article>

        {/* SIDEBAR */}
        <aside className="space-y-12">
          {/* TRENDING */}
          <div>
            <ThemedHeading>Trending News</ThemedHeading>
            <div className="space-y-4">
              {trendingPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`}>
                  <div className="flex gap-3 items-center cursor-pointer border-b border-gray-200 dark:border-gray-700 pb-3 group">
                    <div className="relative w-20 h-14 rounded-md overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div>
                      <h4 className="text-foreground font-bold line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">{post.author}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* AD */}
          <div className="bg-muted h-60 flex items-center justify-center rounded-lg text-muted-foreground">
            Advertisement
          </div>
        </aside>
      </section>

      {/* RELATED POSTS */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-16">
        <ThemedHeading>Related Posts</ThemedHeading>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(2, 5).map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`}>
              <div className="overflow-hidden border-b-[4px] border-black dark:border-white bg-white dark:bg-gray-900 transition group shadow-sm">
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute -bottom-3 right-0 bg-black text-white text-xs px-3 py-1 shadow-lg uppercase tracking-wide">
                    {post.category}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <p className="text-[11px] uppercase font-bold text-muted-foreground tracking-wide">
                    {post.date.toLocaleDateString?.() ?? post.date} · {post.author}
                  </p>
                  <h3 className="text-foreground text-2xl md:text-3xl font-bold line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
