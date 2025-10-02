"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white text-gray-800 border-t border-gray-200">
      {/* Top Grid Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* About */}
        <div>
          <h3 className="text-lg font-bold mb-4">About LoudEar</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            LoudEar is your destination for the latest music and video streaming
            experience. Discover top artists, trending tracks, and exclusive content.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h3 className="text-lg font-bold mb-4">Explore</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/charts" className="hover:text-blue-600">Charts</Link></li>
            <li><Link href="/videos" className="hover:text-blue-600">Videos</Link></li>
            <li><Link href="/artists" className="hover:text-blue-600">Artists</Link></li>
            <li><Link href="/playlists" className="hover:text-blue-600">Playlists</Link></li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-lg font-bold mb-4">Follow Us</h3>
          <div className="flex gap-4 text-gray-600">
            <Link href="https://facebook.com" target="_blank" aria-label="Facebook">
              <Facebook className="w-5 h-5 hover:text-blue-600" />
            </Link>
            <Link href="https://twitter.com" target="_blank" aria-label="Twitter">
              <Twitter className="w-5 h-5 hover:text-sky-500" />
            </Link>
            <Link href="https://instagram.com" target="_blank" aria-label="Instagram">
              <Instagram className="w-5 h-5 hover:text-pink-500" />
            </Link>
            <Link href="https://youtube.com" target="_blank" aria-label="YouTube">
              <Youtube className="w-5 h-5 hover:text-red-600" />
            </Link>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-bold mb-4">Stay Updated</h3>
          <p className="text-sm text-gray-600 mb-3">
            Subscribe to our newsletter for the latest updates, releases, and promos.
          </p>
          <form className="flex w-full max-w-md gap-2">
            <Input type="email" placeholder="Your email" className="bg-gray-100" />
            <Button type="submit">Subscribe</Button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} LoudEar. All rights reserved.
      </div>
    </footer>
  );
}
