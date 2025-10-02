// lib/actions/getAlbums.ts
"use server";

import { ChartItem, getCharts } from "./getCharts";

export const getAlbums = async (limit = 16): Promise<ChartItem[]> => {
  try {
    return await getCharts({
      category: "albums",
      limit,
      sort: "this-week",
      region: "global",
    });
  } catch (error) {
    console.error("[GET_ALBUMS_ERR]", error);
    throw new Error("Failed to fetch trending albums");
  }
};
