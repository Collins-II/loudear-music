"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, Twitter } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface SharePanelProps {
  title: string;
  artist?: string;
  shareCount?: number;
  className?: string;
  /** Optional backend interaction callback */
  onShare?: () => Promise<void> | void;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * 🎧 SharePanel — Universal social sharing component.
 * Responsive, accessible, and production-ready.
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

  const URL = `${BASE_URL}${pathname}`

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
        toast.success("Shared successfully");
        await handleShareRecorded();
      } catch {
        // User cancelled or not supported
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "w-full rounded-2xl bg-white/80 dark:bg-neutral-900/80 border border-black/5 dark:border-white/10 shadow-sm backdrop-blur-sm py-4",
        "hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      <CardHeader className="flex items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          Share this track
        </CardTitle>
        {shareCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-900 dark:text-gray-200">{shareCount}</span>
            <span>shares</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
        {/* Primary share actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={handleNativeShare}
            variant="default"
            className="flex-1 bg-black text-white hover:bg-gray-800 min-w-[120px]"
          >
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>

          <Button
            onClick={handleCopyLink}
            variant="outline"
            aria-label="Copy link"
            className="flex items-center justify-center min-w-[50px]"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>

        {/* Social networks */}
        <div className="flex flex-wrap gap-2 pt-2">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} — ${artist ?? ""}`)}&url=${encodeURIComponent(URL)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-neutral-800 transition w-full sm:w-auto justify-center"
          >
            <Twitter className="w-4 h-4 text-sky-500" /> Twitter
          </a>

          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(URL)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-neutral-800 transition w-full sm:w-auto justify-center"
          >
            <svg
              className="w-4 h-4 text-blue-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H8.9v-3h1.5V9.3c0-1.5.9-2.4 2.3-2.4.7 0 1.4.1 1.4.1v1.6h-.8c-.8 0-1 0-1 1v1.2h1.8l-.3 3h-1.5v7A10 10 0 0 0 22 12z" />
            </svg>
            Facebook
          </a>
          
        </div>
      </CardContent>
    </motion.div>
  );
}
