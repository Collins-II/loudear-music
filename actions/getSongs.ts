"use server";

import { ChartItem, getCharts } from "./getCharts";

/* ------------------------------------------------------------- */
/* Get latest songs as ChartItems                                 */
/* ------------------------------------------------------------- */
// lib/actions/getSongs.ts


export const getSongs = async (limit = 16): Promise<ChartItem[]> => {
    return await getCharts({
      category: "songs",
      limit,
      sort: "all-time",
      region: "global",
    });
};


