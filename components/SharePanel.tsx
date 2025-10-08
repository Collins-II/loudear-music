"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Share2, Copy, Check } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebook } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { TiSocialInstagram } from "react-icons/ti";
import { FaTiktok } from "react-icons/fa6";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface SharePanelProps {
  title: string;
  artist?: string;
  shareCount?: number;
  className?: string;
  onShare?: () => Promise<void> | void;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * 🎧 SharePanel — Modern & minimal social sharing panel with motion and vibrant icons.
 */
export default function SharePanel({
  title,
  artist,
  shareCount = 0,
  className,
  onShare,
}: SharePanelProps) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  const URL = `${BASE_URL}${pathname}`;

  const handleShareRecorded = useCallback(async () => {
    try {
      if (onShare) await onShare();
    } catch (err) {
      console.error("SharePanel: share tracking failed", err);
    }
  }, [onShare]);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title}${artist ? ` — ${artist}` : ""}`,
          text: `Listen to ${title}${artist ? ` by ${artist}` : ""}`,
          url: URL,
        });
        toast.success("Shared successfully!");
        await handleShareRecorded();
      } catch {
        // ignored
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
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

  const socials = [
    {
      name: "Twitter",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} — ${artist ?? ""}`)}&url=${encodeURIComponent(URL)}`,
      color: "text-sky-500 hover:bg-sky-500/10",
      icon: FaXTwitter,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(URL)}`,
      color: "text-blue-600 hover:bg-blue-600/10",
      icon:  FaFacebook,
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/",
      color: "text-pink-500 hover:bg-pink-500/10",
      icon: TiSocialInstagram,
    },
    {
      name: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} — ${artist ?? ""} ${URL}`)}`,
      color: "text-green-500 hover:bg-green-500/10",
      icon: IoLogoWhatsapp,
    },
    {
      name: "TikTok",
      href: `https://api.tiktok.com/send?text=${encodeURIComponent(`${title} — ${artist ?? ""} ${URL}`)}`,
      color: "text-red-500 hover:bg-red-500/10",
      icon: FaTiktok,
    },
  ];

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

      <CardContent className="pt-3 space-y-4">
        {/* Primary share / copy */}
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

        {/* Social icons grid */}
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
                "flex flex-col items-center justify-center p-2.5  dark:border-white/10 transition-all duration-200",
                s.color
              )}
            >
              <s.icon className="w-6 h-6 text-black" />
              {/*<span className="text-[11px] mt-1 font-medium">{s.name}</span>*/}
            </motion.a>
          ))}
        </div>
      </CardContent>
    </motion.div>
  );
}
