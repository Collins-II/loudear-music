"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, UploadCloud, Music, VideoIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import SignInButton from "@/components/auth/SignInButton";
import { useEffect } from "react";

interface SidebarProps {
  scrolled: boolean;
  navItems: { href: string; label: string }[];
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  handleMediaClick: () => void;
}

export default function Sidebar({
  scrolled,
  navItems,
  mobileOpen,
  setMobileOpen,
  handleMediaClick,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  // Disable scroll on body when sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <AnimatePresence>
      {mobileOpen && (
        <>
          {/* 🔹 BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black z-[50]"
            onClick={() => setMobileOpen(false)}
          />

          {/* 🔹 SIDEBAR PANEL */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className={`fixed top-0 right-0 w-72 h-screen rounded-bl-xl z-[60] flex flex-col shadow-lg transition-colors duration-300 ${
              scrolled ? "bg-white text-gray-900" : "bg-black text-white"
            }`}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center px-6 py-4">
              <Link href="/" className="flex items-center gap-2">
                <span
                  className={`italic text-2xl md:text-3xl font-extrabold transition-colors ${
                    scrolled ? "text-primary" : "text-white"
                  }`}
                >
                  LoudEar
                </span>
              </Link>
              <button
                aria-label="close-button"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <Separator />

            {/* NAVIGATION */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block text-base font-semibold transition-colors ${
                      isActive
                        ? "text-blue-500"
                        : scrolled
                        ? "text-gray-700 hover:text-blue-600"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* FOOTER (Sticky Bottom) */}
            <div className="sticky bottom-0 left-0 right-0 bg-inherit border-t border-gray-700/30 p-6 space-y-4 z-[70]">
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="default"
                      className={`rounded-full w-full gap-2 ${
                        scrolled ? "bg-gray-900 text-white" : "bg-white text-black"
                      }`}
                    >
                      <UploadCloud className="w-5 h-5" /> Submit Media
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    align="start"
                    className={`w-full z-[80] border-none ${
                      scrolled ? "bg-white text-gray-900" : "bg-black text-white"
                    }`}
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
                <>
                  <Button
                    variant="default"
                    className="rounded-full gap-2 w-full bg-blue-600 text-white hover:bg-blue-700"
                    onClick={handleMediaClick}
                  >
                    <UploadCloud className="w-5 h-5" /> Submit Media
                  </Button>

                  <div className="pt-4">
                    <SignInButton />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
