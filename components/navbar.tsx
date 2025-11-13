"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import {
  X,
  Search,
} from "lucide-react";
import { TbMenu3 } from "react-icons/tb";
import SignInButton from "./auth/SignInButton";
import { toast } from "sonner";
import NavSidebar from "./sidebar";
import Image from "next/image";
//import { SiYoutubestudio } from "react-icons/si";
import { TbLoaderQuarter } from "react-icons/tb";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false); // desktop search
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false); // mobile search
  //const [animate, setAnimate] = useState(false);
  const [onSearch, setOnSearch] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Charts", href: "/charts" },
    { label: "Music", href: "/music" },
    { label: "Videos", href: "/videos" },
    { label: "Playlists", href: "/playlists" },
    { label: "Blog", href: "/blog" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOnSearch(true)
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setOnSearch(false)
      setSearchQuery("");
      setSearchOpen(false);
      setMobileSearchOpen(false);
      setMobileOpen(false);
    }
  };

  const handleMediaClick = () => {
    if (!session) {
      //setAnimate(true);
      toast("You need to sign in first to submit media.");
      //setTimeout(() => setAnimate(false), 800);
    } else {
      router.push("/studio/dashboard");
      setMobileOpen(false);
    }
  };


  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120 }}
      className={`fixed w-full z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-white shadow-md text-gray-900"
          : "bg-black/60 backdrop-blur-md text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span
            className={`italic text-2xl md:text-3xl font-extrabold transition-colors ${
              scrolled ? "text-primary" : "text-white"
            }`}
          >
            <Image src="/assets/logo/logo-bl.jpg" alt="Loudear-Logo" width={50} height={50} className="rounded-full object-cover shadow-2xl"/>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`uppercase relative px-2 py-1 text-sm md:text-base font-semibold transition-all ${
                  isActive
                    ? scrolled
                      ? "text-blue-600 after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-1 after:bg-blue-600 after:rounded-full"
                      : "text-white after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-1 after:bg-blue-400 after:rounded-full"
                    : scrolled
                    ? "text-gray-700 hover:text-blue-600"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* 🔍 Search Toggle */}
          <div className="relative">
            <button
              aria-label="toggle-search"
              onClick={() => setSearchOpen((prev) => !prev)}
              className={`p-2 rounded-full transition ${
                scrolled ? "bg-gray-100 text-gray-800" : "bg-white/20 text-white"
              } hover:scale-105`}
            >
              { onSearch ? (<TbLoaderQuarter size={18} />) : (<Search size={18} />) }
            </button>

            <AnimatePresence>
              {searchOpen && (
                <motion.form
                  onSubmit={handleSearch}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute right-0 mt-2 w-80 border rounded-full px-3 py-2 flex items-center gap-2 ${
                    scrolled
                      ? "bg-white text-gray-900 border-gray-200"
                      : "bg-black/90 text-white border-black"
                  }`}
                >
                  <input
                    type="text"
                    placeholder="Search tracks, videos, artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className={`flex-1 px-4 py-1 text-sm rounded-full border-none focus:ring-2 transition-colors duration-200 ${
                      scrolled
                        ? "bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-blue-500"
                        : "bg-black/50 text-white placeholder-white/60 focus:ring-blue-400"
                    } focus:outline-none`}
                  />
                  <Button type="submit" size="sm" className="rounded-full">
                    Go
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Submit Media 
           <motion.div
                animate={animate ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
          <Button
            className={`w-full justify-center uppercase rounded-full gap-2 font-semibold ${
              scrolled
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-white text-black hover:bg-neutral-100"
            }`}
            onClick={handleMediaClick}
          >
             Studio <SiYoutubestudio />
          </Button>
          </motion.div>*/}

          <SignInButton />
        </div>

        {/* Mobile Menu & Search Toggle */}
        <div className="md:hidden flex items-center gap-2">
          {/* Search Toggle */}
          <button
            aria-label="toggle-mobile-search"
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            className={`p-2 rounded-full transition ${
              scrolled ? "bg-gray-100 text-gray-800" : "bg-white/20 text-white"
            }`}
          >
            {onSearch ? (<TbLoaderQuarter size={18} />) : (<Search size={18} />)}
          </button>

          {/* Menu Toggle */}
          <button
            aria-label="Toggle Menu"
            className={`p-2 transition-colors ${
              scrolled ? "text-gray-800" : "text-white"
            }`}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <TbMenu3 className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.form
            onSubmit={handleSearch}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden px-4 py-2 flex items-center gap-2 ${
              scrolled ? "bg-white text-gray-900" : "bg-black text-white"
            }`}
          >
            <input
              type="text"
              placeholder="Search tracks, videos, artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className={`flex-1 px-4 py-2 text-sm rounded-full border-none focus:ring-2 transition-colors duration-200 ${
                scrolled
                  ? "bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-blue-500"
                  : "bg-black/50 text-white placeholder-white/60 focus:ring-blue-400"
              } focus:outline-none`}
            />
            <Button type="submit" size="sm" className="rounded-full">
              Go
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40"
              style={{
                backgroundColor: scrolled
                  ? "rgba(255,255,255,0.5)"
                  : "rgba(0,0,0,0.5)",
              }}
              onClick={() => setMobileOpen(false)}
            />

            <NavSidebar
              scrolled={scrolled}
              navItems={navItems}
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
              handleMediaClick={handleMediaClick}
            />
  
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
