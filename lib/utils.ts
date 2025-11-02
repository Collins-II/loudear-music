import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import JSZip from "jszip";
import { saveAs } from "file-saver";
// lib/utils/normalizeDoc.ts
import { ISong } from "@/lib/database/models/song";
import { IAlbum } from "@/lib/database/models/album";
import { IVideo } from "@/lib/database/models/video";
import { IUser } from "./database/models/user";
/**
 * Utility to format and handle view counts.
 * Provides helpers to format, increment, and parse view numbers.
 */
/**
 * Utility functions for handling view counts, growth analytics,
 * and number formatting for music / media / auction platforms.
 */

export async function bufferFromFile(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/** --- 📊 Basic Formatting --- */
export function formatViews(views: number): string {
  if (isNaN(views) || views < 0) return "0";

  if (views < 1000) return views.toString();
  if (views < 1_000_000) return (views / 1000).toFixed(views < 10_000 ? 1 : 0) + "K";
  if (views < 1_000_000_000) return (views / 1_000_000).toFixed(1) + "M";
  return (views / 1_000_000_000).toFixed(1) + "B";
}

/** --- ➕ Safe Increment --- */
export function incrementViews(
  currentViews: number,
  incrementBy = 1,
  maxViews = Infinity
): number {
  if (isNaN(currentViews)) currentViews = 0;
  const newCount = currentViews + incrementBy;
  return newCount > maxViews ? maxViews : newCount;
}

/** --- 🔁 Parse Formatted Numbers --- */
export function parseFormattedViews(formatted: string): number {
  const match = formatted.match(/^([\d.]+)\s*([KMB])?$/i);
  if (!match) return parseFloat(formatted) || 0;

  const [, num, suffix] = match;
  const value = parseFloat(num);

  switch (suffix?.toUpperCase()) {
    case "K":
      return value * 1_000;
    case "M":
      return value * 1_000_000;
    case "B":
      return value * 1_000_000_000;
    default:
      return value;
  }
}

/** --- 📈 Trending Growth Analytics --- */

/**
 * Calculate growth percentage and trend label.
 * @param current - current period views
 * @param previous - previous period views
 * @returns { growthPercent, trendLabel, isTrendingUp }
 */
export function calculateViewGrowth(current: number, previous: number) {
  if (previous <= 0) return { growthPercent: 100, trendLabel: "🚀 New", isTrendingUp: true };

  const change = current - previous;
  const growthPercent = (change / previous) * 100;

  let trendLabel = "Stable";
  if (growthPercent > 20) trendLabel = "🔥 Trending Up";
  else if (growthPercent > 5) trendLabel = "📈 Growing";
  else if (growthPercent < -10) trendLabel = "📉 Falling";
  else if (growthPercent < 0) trendLabel = "⚠️ Slight Drop";

  return {
    growthPercent: parseFloat(growthPercent.toFixed(1)),
    trendLabel,
    isTrendingUp: growthPercent >= 0,
  };
}

/** --- 🕒 Weekly Trend Analyzer --- */
/**
 * Given a series of daily/weekly view counts,
 * returns average growth rate and trend classification.
 */
export function analyzeViewTrends(viewHistory: number[]): {
  avgGrowth: number;
  trend: string;
} {
  if (!viewHistory.length) return { avgGrowth: 0, trend: "No Data" };

  let totalGrowth = 0;
  for (let i = 1; i < viewHistory.length; i++) {
    const prev = viewHistory[i - 1];
    const curr = viewHistory[i];
    totalGrowth += ((curr - prev) / (prev || 1)) * 100;
  }

  const avgGrowth = totalGrowth / (viewHistory.length - 1);

  let trend = "Stable";
  if (avgGrowth > 20) trend = "🔥 Rapid Growth";
  else if (avgGrowth > 5) trend = "📈 Consistent Growth";
  else if (avgGrowth < -10) trend = "📉 Declining";
  else if (avgGrowth < 0) trend = "⚠️ Slight Decline";

  return {
    avgGrowth: parseFloat(avgGrowth.toFixed(1)),
    trend,
  };
}



export function isBaseSerialized(obj: any): obj is { title: string; artist: string; genre?: string; _id: string } {
  return !!obj && typeof obj === "object" && typeof obj.title === "string" && typeof obj.artist === "string" && !!obj._id;
}

export  function addSnippet(song: ISong) {
  const duration = song.duration ?? 0;
  if (duration < 15) return null;

  const start = Math.floor(Math.random() * Math.max(1, duration - 10));
  const snippetStart = Math.max(5, start);
  const snippetEnd = Math.min(duration, snippetStart + 10);

  return { start: snippetStart, end: snippetEnd };
}


export function normalizeDoc(doc: ISong | IAlbum | IVideo) {
  const anyDoc: any = doc;
  return {
    _id: String(anyDoc._id),
    title: anyDoc.title ?? anyDoc.name ?? "Untitled",
    artist: anyDoc.artist ?? anyDoc.curator ?? undefined,
    coverUrl: anyDoc.coverUrl ?? anyDoc.thumbnailUrl ?? "",
    videoUrl: (anyDoc as IVideo).videoUrl ?? undefined,
    viewCount: anyDoc.viewCount ?? (Array.isArray(anyDoc.views) ? anyDoc.views.length : 0),
    downloadCount: anyDoc.downloadCount ?? (Array.isArray(anyDoc.downloads) ? anyDoc.downloads.length : 0),
    likeCount: anyDoc.likeCount ?? (Array.isArray(anyDoc.likes) ? anyDoc.likes.length : 0),
    shareCount: anyDoc.shareCount ?? (Array.isArray(anyDoc.shares) ? anyDoc.shares.length : 0),
    commentCount: anyDoc.commentCount ?? 0,
    genre: anyDoc.genre ?? "Unknown",
    releaseDate: anyDoc.createdAt,
  };
}


/**
 * Download a single file
 */
export async function downloadFile(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    saveAs(blob, filename);
  } catch (err) {
    console.error("Download failed:", err);
  }
}

/**
 * Download multiple files as a ZIP archive
 */
export async function downloadZip(
  files: { url: string; name: string }[],
  zipName: string
) {
  const zip = new JSZip();

  for (const file of files) {
    try {
      const res = await fetch(file.url);
      const blob = await res.blob();
      zip.file(file.name, blob);
    } catch (err) {
      console.error(`Failed to fetch ${file.url}`, err);
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, zipName);
}


export const formatTime = (secs: number) => {
  if (!Number.isFinite(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const cls = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(" ");

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const posted = new Date(date);
  const seconds = Math.floor((now.getTime() - posted.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

/**
 * Convert duration in seconds to hh:mm:ss or mm:ss format
 * @param duration - duration in seconds
 * @returns formatted time string
 */
export function formatDuration(duration: number): string {
  if (isNaN(duration) || duration < 0) return "00:00";

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);

  const pad = (val: number) => String(val).padStart(2, "0");

  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
};

/**
 * Convert a Date object or timestamp into YYYY-MM-DD format
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Convert a Date object or timestamp into a human-readable string (e.g. "Sep 2, 2025")
 */
export function formatDatePretty(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    //month: "short",
    //day: "numeric",
  });
}

export function profileComplete(user?: IUser): boolean {
  if (!user) return false;

 /* // Normalize genres (handle both arrays and comma-separated strings)
  let genresArray: string[] = [];

  if (Array.isArray(user.genres)) {
    genresArray = user.genres.flatMap((g) =>
      typeof g === "string" ? g.split(",").map((x) => x.trim()) : []
    );
  } else if (typeof user.genres === "string") {
    genresArray = user.genres?.map((x) => x.trim());
  }*/

  // Check required artist fields
  const requiredFields =
    user.role === "artist"
      ? [user.bio, user.location, user.phone]
      : [user.name, user.email];

  const allFilled = requiredFields.every(
    (field) => typeof field === "string" && field.trim().length > 0
  );

  return allFilled;
}
