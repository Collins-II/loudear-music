// lib/actions/getVideos.ts
"use server";

import { ChartItem, getCharts } from "./getCharts";

export const getVideos = async (limit = 16): Promise<ChartItem[]> => {
    return await getCharts({
      category: "videos",
      limit,
      sort: "all-time",
      region: "global",
    });
};
