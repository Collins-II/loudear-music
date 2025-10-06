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

export function isBaseSerialized(obj: any): obj is { title: string; artist: string; genre?: string; _id: string } {
  return !!obj && typeof obj === "object" && typeof obj.title === "string" && typeof obj.artist === "string" && !!obj._id;
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
