"use server";

import { ISong } from "@/lib/database/models/song";
import { IAlbum } from "@/lib/database/models/album";

import { ChartItem, getCharts } from "./getCharts";
import { normalizeDoc } from "@/lib/utils";
 // ✅ reuse existing normalizer

 function addSnippet(song: ISong) {
  const duration = song.duration ?? 0;
  if (duration < 15) return null;

  const start = Math.floor(Math.random() * Math.max(1, duration - 10));
  const snippetStart = Math.max(5, start);
  const snippetEnd = Math.min(duration, snippetStart + 10);

  return { start: snippetStart, end: snippetEnd };
}


/* ------------------------------------------------------------- */
/* Utility: build ChartItem                                       */
/* ------------------------------------------------------------- */
function toChartItem(
  doc: ISong | IAlbum,
  idx: number,
  region: string = "global"
): ChartItem {
  const n = normalizeDoc(doc);

  return {
    id: n._id,
    title: n.title,
    artist: n.artist,
    image: n.coverUrl ?? "",
    videoUrl: (n as any).videoUrl,
    position: idx + 1,
    lastWeek: null,
    peak: idx + 1,
    weeksOn: 1,
    region,
    genre: n.genre ?? "Unknown",
    releaseDate: n.releaseDate,
    stats: {
      plays: n.viewCount ?? 0,
      downloads: n.downloadCount ?? 0,
      likes: n.likeCount ?? 0,
      views: n.viewCount ?? 0,
      shares: n.shareCount ?? 0,
      comments: n.commentCount ?? 0,
    },
    snippet: (doc as ISong).duration ? addSnippet(doc as ISong) : undefined as any,
  };
}

/* ------------------------------------------------------------- */
/* Get latest songs as ChartItems                                 */
/* ------------------------------------------------------------- */
// lib/actions/getSongs.ts


export const getSongs = async (limit = 16): Promise<ChartItem[]> => {
  try {
    return await getCharts({
      category: "songs",
      limit,
      sort: "this-week",
      region: "global",
    });
  } catch (error) {
    console.error("[GET_SONGS_ERR]", error);
    throw new Error("Failed to fetch trending songs");
  }
};


