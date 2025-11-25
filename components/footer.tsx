"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-black italic text-gray-800 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700">
      {/* Top Grid Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* About */}
        <div>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/logo/logo-bl.jpg"
              alt="Loudear-Logo"
              width={50}
              height={50}
              className="rounded-full object-cover shadow-2xl transition-all"
            />
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-2">
            LoudEar is your destination for the latest music and video streaming
            experience. Discover top artists, trending tracks, and exclusive content.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-black dark:text-white">Explore</h3>
          <ul className="space-y-2 font-semibold text-md">
            <li><Link href="/charts" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Charts</Link></li>
            <li><Link href="/music" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Music</Link></li>
            <li><Link href="/videos" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Videos</Link></li>
            <li><Link href="/playlists" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Playlists</Link></li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-black dark:text-white">Follow Us</h3>
          <div className="flex gap-4">
            <Link href="https://facebook.com" target="_blank" aria-label="Facebook">
              <Facebook className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
            </Link>
            <Link href="https://twitter.com" target="_blank" aria-label="Twitter">
              <Twitter className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors" />
            </Link>
            <Link href="https://instagram.com" target="_blank" aria-label="Instagram">
              <Instagram className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors" />
            </Link>
            <Link href="https://youtube.com" target="_blank" aria-label="YouTube">
              <Youtube className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-black dark:text-white">Stay Updated</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Subscribe to our newsletter for the latest updates, releases, and promos.
          </p>
          <form className="flex w-full max-w-md gap-2">
            <Input
              type="email"
              placeholder="Your email"
              className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <Button type="submit">Subscribe</Button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 dark:border-gray-700 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} LoudEar. All rights reserved.
      </div>
    </footer>
  );
}
