"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Share2, Copy, Check } from "lucide-react";
import { FaXTwitter, FaFacebook } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io";
import { FaTelegram } from "react-icons/fa";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface SharePanelProps {
  userId?: string;
  title: string;
  artist?: string;
  shareCount?: number;
  className?: string;
  onShare?: () => Promise<void> | void;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://your-production-domain.com";

/**
 * 🎧 SharePanel — Production-ready, secure, and user-aware social sharing component.
 */
export default function SharePanel({
  userId,
  title,
  artist,
  shareCount = 0,
  className,
  onShare,
}: SharePanelProps) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  const URL = `${BASE_URL}${pathname}`;
  const displayName = `${title}${artist ? ` — ${artist}` : ""}`;
  const encodedTitle = encodeURIComponent(displayName);
  const encodedURL = encodeURIComponent(URL);

  /* -------------------------------------------------------------------------- */
  /* AUTH + SHARE LOGIC                                                         */
  /* -------------------------------------------------------------------------- */

  const requireAuth = useCallback(() => {
    if (!userId) {
      toast.error("You need to sign in to share content.");
      return false;
    }
    return true;
  }, [userId]);

  const handleShareRecorded = useCallback(async () => {
    if (!requireAuth()) return;

    try {
      if (onShare) await onShare();
    } catch (err) {
      console.error("SharePanel: share tracking failed", err);
    }
  }, [onShare, requireAuth]);

  const handleNativeShare = async () => {
    if (!requireAuth()) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: displayName,
          text: `Listen to ${displayName}`,
          url: URL,
        });
        toast.success("Shared successfully!");
        await handleShareRecorded();
      } catch {
        // User cancelled share
      }
    } else {
      await handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    if (!requireAuth()) return;

    try {
      await navigator.clipboard.writeText(URL);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
      await handleShareRecorded();
    } catch {
      toast.error("Failed to copy link");
    }
  };

  /* -------------------------------------------------------------------------- */
  /* PRODUCTION SOCIAL LINKS                                                    */
  /* -------------------------------------------------------------------------- */

const socials = [
  {
    name: "X (Twitter)",
    href: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedURL}`,
    color: "text-sky-500 hover:bg-sky-500/10",
    icon: FaXTwitter,
  },
  {
    name: "Facebook",
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodedURL}`,
    color: "text-blue-600 hover:bg-blue-600/10",
    icon: FaFacebook,
  },
  {
    name: "WhatsApp",
    href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${displayName} - ${URL}`)}`,
    color: "text-green-500 hover:bg-green-500/10",
    icon: IoLogoWhatsapp,
  },
  {
    name: "Telegram",
    href: `https://t.me/share/url?url=${encodedURL}&text=${encodedTitle}`,
    color: "text-sky-600 hover:bg-sky-600/10",
    icon: FaTelegram, // use FaTelegram from react-icons/fa6
  },
];


  /* -------------------------------------------------------------------------- */
  /* UI                                                                         */
  /* -------------------------------------------------------------------------- */

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cn(
        "border-b-[4px] border-black py-3 dark:border-white/5 bg-gradient-to-br from-white/80 to-gray-50/60 dark:from-neutral-900/80 dark:to-neutral-950/70 backdrop-blur-md transition-all duration-300",
        className
      )}
    >
      <CardHeader className="flex items-center justify-between pb-3">
        <CardTitle className="text-sm md:text-base font-light text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-primary" />
          Share with
        </CardTitle>
        {shareCount > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {shareCount} shares
          </span>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary Share Buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleNativeShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white bg-gradient-to-r from-black to-gray-800 dark:from-gray-200 dark:to-gray-400 dark:text-black font-medium shadow hover:opacity-90 transition-all"
          >
            <Share2 className="w-4 h-4" /> Share
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCopyLink}
            aria-label="Copy link"
            className={cn(
              "p-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition",
              copied && "text-green-500 border-green-500"
            )}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </motion.button>
        </div>

        {/* Socials */}
        <div className="grid grid-cols-5 gap-3 pt-2">
          {socials.map((s) => (
            <motion.a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex flex-col items-center justify-center p-2.5 rounded-xl border border-gray-200 dark:border-white/10 transition-all duration-200",
                s.color
              )}
              onClick={(e) => {
                if (!userId) {
                  e.preventDefault();
                  toast.error("Please sign in to share.");
                  return;
                }
                handleShareRecorded();
              }}
            >
              <s.icon className="w-6 h-6 text-black dark:text-white" />
            </motion.a>
          ))}
        </div>
      </CardContent>
    </motion.div>
  );
}
