"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { blogPosts } from "../page";

// Dummy blog data
const blogPostsData = [
  {
    id: 1,
    title: "Cleo Ice Queen Drops New Single ‘Power’",
    excerpt: "The hip hop queen returns with a bold anthem set to dominate the charts this Friday.",
    image: "/assets/images/cleo-blog01.jpg",
    date: "Sept 5, 2025",
    author: "LoudEar Editorial",
    content: `
Cleo Ice Queen makes a powerful comeback with her latest single “Power.” 
The track blends sharp hip hop lyricism with Afrobeat rhythms, marking 
her boldest release to date. Fans can expect an empowering anthem that 
celebrates resilience, strength, and ambition.

In a behind-the-scenes look, Cleo shared her inspiration for the song, 
describing it as a "reflection of every queen who had to fight for her 
place in the world." Early reviews already hail it as a chart-topper in the making.

The single will officially drop this Friday across all streaming platforms. 
Stay tuned for exclusive visuals premiering the same day.
`,
  },
  {
    id: 2,
    title: "Top 10 Rising African Artists to Watch",
    excerpt: "From Afrobeat to Hip Hop, here are the hottest acts shaping the future of music.",
    image: "/assets/images/cleo-07.jpg",
    date: "Sept 3, 2025",
    author: "LoudEar Team",
    content: `
Africa’s music scene is exploding with fresh talent. From Lagos to Lusaka, 
the continent continues to produce artists with global appeal. 
In this list, we highlight 10 upcoming stars whose sound is already shaping 
the next wave of African music.
`,
  },
  {
    id: 3,
    title: "Inside the Studio: Rich Bizzy’s Creative Process",
    excerpt: "Go behind the scenes with one of Zambia’s most celebrated hitmakers.",
    image: "/assets/images/bizzy03.jpg",
    date: "Sept 1, 2025",
    author: "LoudEar Features",
    content: `
Rich Bizzy opens the doors to his studio and creative process, giving fans 
a rare look at how hits are made. From beat selection to lyrical inspiration, 
the Zambian star shares insights into his journey as an artist.
`,
  },
];

export default function BlogPostPage() {
  const params = useParams();
  const postId = Number(params?.id);
  const post = blogPostsData.find((p) => p.id === postId);

  if (!post) {
    return (
      <main className="flex items-center justify-center h-screen bg-background">
        <h1 className="text-2xl font-bold">Post not found</h1>
      </main>
    );
  }

  //const relatedPosts = blogPostsData.filter((p) => p.id !== post.id).slice(0, 2);
  const trendingPosts = blogPostsData.slice(0, 3);

  return (
    <main className="bg-background">
      {/* Hero Section */}
      <section className="relative h-[450px] md:h-[550px] w-full overflow-hidden">
        <Image src={post.image} alt={post.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <div className="max-w-5xl mx-auto px-6 pb-12 text-white">
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-extrabold leading-tight"
            >
              {post.title}
            </motion.h1>
            <p className="text-gray-200 mt-2 text-lg md:text-xl">{post.excerpt}</p>
            <p className="text-gray-400 text-sm mt-1">{timeAgo(post.date)} · {post.author}</p>
          </div>
        </div>
      </section>

      {/* Main Content + Sidebar */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Article */}
        <article className="lg:col-span-2 space-y-4 text-gray-700">
          {post.content
            .trim()
            .split("\n")
            .map((para, i) => (
              <p key={i} className="italic text-lg md:text-xl leading-relaxed">
                {para}
              </p>
            ))}
        </article>

        {/* Sidebar */}
        <aside className="space-y-12">
          {/* Trending */}
          <div>
            <h3 className="relative text-slate-900 text-2xl font-extrabold mb-6 tracking-tight">
              <span className="relative z-10 bg-white pr-3">Trending News</span>
              <span className="absolute left-0 top-1/2 w-full h-[8px] bg-black -z-0"></span>
            </h3>
            <div className="space-y-4">
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
                      <p className="text-xs text-gray-600">{post.author}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Advertisement */}
          <div className="bg-gray-200 h-60 flex items-center justify-center rounded-lg">
            <span className="text-gray-500">Advertisement</span>
          </div>
        </aside>
      </section>

      {/* Related Posts */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-16">
        <h3 className="relative text-slate-900 text-2xl font-extrabold mb-6 tracking-tight">
          <span className="relative z-10 bg-white pr-3">Related Posts</span>
          <span className="absolute left-0 top-1/2 w-full h-[8px] bg-black -z-0"></span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(2,5).map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`}>
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
                                        <div className="pb-4 pt-1 space-y-2">
                                          <p className="flex justify-start text-[11px] uppercase font-bold text-slate-500 tracking-wide">
                                            {post.date.toLocaleDateString()} · {post.author}
                                          </p>
                                          <h3 className="text-black text-2xl md:text-4xl font-bold line-clamp-2">{post.title}</h3>
                                          <p className="text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>
                                        </div>
                                      </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
