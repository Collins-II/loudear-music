"use server";

import { ChartItem, getCharts } from "./getCharts";

/* ------------------------------------------------------------- */
/* Get latest songs as ChartItems                                 */
/* ------------------------------------------------------------- */
// lib/actions/getSongs.ts


export const getSongs = async (limit = 16): Promise<ChartItem[]> => {
  try {
    return await getCharts({
      category: "songs",
      limit,
      sort: "all-time",
      region: "global",
    });
  } catch (error) {
    console.error("[GET_SONGS_ERR]", error);
    throw new Error("Failed to fetch trending songs");
  }
};


