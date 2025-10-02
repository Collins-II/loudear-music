"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import {
  X,
  UploadCloud,
  Music,
  VideoIcon,
  Search,
} from "lucide-react";
import { TbMenu3 } from "react-icons/tb";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";
import SignInButton from "./auth/SignInButton";
import { toast } from "sonner";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false); // desktop search
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false); // mobile search
  const [animate, setAnimate] = useState(false);

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
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
      setMobileSearchOpen(false);
      setMobileOpen(false);
    }
  };

  const handleMediaClick = () => {
    if (!session) {
      setAnimate(true);
      toast("You need to sign in first to submit media.");
      setTimeout(() => setAnimate(false), 800);
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
            LoudEar
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-2 py-1 text-sm md:text-base font-semibold transition-all ${
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
              <Search size={18} />
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

          {/* Submit Media */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div
                animate={animate ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                <Button
                  variant="default"
                  className="rounded-full gap-2"
                  onClick={handleMediaClick}
                >
                  <UploadCloud className="w-5 h-5" />
                  Submit Media
                </Button>
              </motion.div>
            </DropdownMenuTrigger>

            {session && (
              <DropdownMenuContent
                align="end"
                className="bg-black/90 border-none w-48 text-white"
              >
                <DropdownMenuItem
                  onClick={() => router.push("/upload/song")}
                  className="gap-2"
                >
                  <Music className="w-4 h-4" />
                  Upload Song
                </DropdownMenuItem>
                <Separator className="bg-neutral-600" />
                <DropdownMenuItem
                  onClick={() => router.push("/upload/video")}
                  className="gap-2"
                >
                  <VideoIcon className="w-4 h-4" />
                  Upload Video
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>

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
            <Search size={18} />
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

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className={`fixed top-0 right-0 w-72 h-screen z-50 flex flex-col shadow-lg ${
                scrolled ? "bg-white text-gray-900" : "bg-black text-white"
              }`}
            >
              <div className="flex justify-between items-center px-6 py-4">
                <span className="font-bold text-lg">Menu</span>
                <button aria-label="close-button" onClick={() => setMobileOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <Separator/>

              {/* Mobile Nav + Search + Submit Media Dropdown */}
              <div className="flex-1 px-6 py-4 overflow-y-auto space-y-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block text-base font-semibold ${
                        isActive
                          ? "text-blue-500"
                          : scrolled
                          ? "text-gray-700 hover:text-blue-600"
                          : "text-gray-200 hover:text-white"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                
              </div>
               {/* Submit Media Dropdown for Mobile */}
               <div className="px-6 pb-4">
                {session ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="default" className="rounded-full gap-2 w-full">
                        <UploadCloud className="w-5 h-5" /> Submit Media
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className={`${
                        scrolled ? "bg-white text-gray-900" : "bg-black text-white"
                      } w-full border-none`}
                    >
                      <DropdownMenuItem
                        onClick={() => {
                          router.push("/upload/song");
                          setMobileOpen(false);
                        }}
                        className="gap-2"
                      >
                        <Music className="w-4 h-4" />
                        Upload Song
                      </DropdownMenuItem>
                      <Separator className="bg-neutral-600" />
                      <DropdownMenuItem
                        onClick={() => {
                          router.push("/upload/video");
                          setMobileOpen(false);
                        }}
                        className="gap-2"
                      >
                        <VideoIcon className="w-4 h-4" />
                        Upload Video
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="default"
                    className="rounded-full gap-2 w-full"
                    onClick={handleMediaClick}
                  >
                    <UploadCloud className="w-5 h-5" /> Submit Media
                  </Button>
                )}
              </div>
              <div className="px-6 py-4 border-t space-y-4">
                <SignInButton />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
