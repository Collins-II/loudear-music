"use client";

import { motion } from "framer-motion";
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
  setMobileOpen,
  handleMediaClick,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "tween", duration: 0.3 }}
      className={`fixed top-0 right-0 w-72 h-screen z-50 flex flex-col justify-between shadow-lg transition-colors duration-300 ${
        scrolled ? "bg-white text-gray-900" : "bg-black text-white"
      }`}
    >
      {/* HEADER */}
      <div>
        <div className="flex justify-between items-center px-6 py-4">
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
          <button
            aria-label="close-button"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <Separator />

        {/* NAVIGATION LINKS */}
        <div className="flex-1 px-6 py-4 overflow-y-auto space-y-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block text-base font-semibold transition-colors ${
                  isActive
                    ? "text-blue-500"
                    : scrolled
                    ? "text-gray-700 hover:text-blue-600"
                    : "text-gray-300 hover:text-white"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* FOOTER SECTION (UPLOAD + SIGN IN) */}
      <div className="p-6 border-t border-gray-700/30 space-y-4">
        {/* Submit Media */}
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
              align="start"
              className={`w-full border-none ${
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

            {/* Sign-In Section */}
            <div className="border-t border-gray-700/30 pt-4">
              <SignInButton />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
