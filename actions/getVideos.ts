// lib/actions/getVideos.ts
"use server";

import { ChartItem, getCharts } from "./getCharts";

export const getVideos = async (limit = 16): Promise<ChartItem[]> => {
  try {
    return await getCharts({
      category: "videos",
      limit,
      sort: "this-week",
      region: "global",
    });
  } catch (error) {
    console.error("[GET_VIDEOS_ERR]", error);
    throw new Error("Failed to fetch trending videos");
  }
};
