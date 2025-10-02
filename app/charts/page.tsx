// app/charts/page.tsx
import React from "react";
import IndexChart from "./components/IndexChart"; // client component (use client)
import { getCharts, ChartItem } from "@/actions/getCharts";

interface Props {
  searchParams?: {
    category?: string;
    region?: string;
    sort?: string;
    limit?: string;
  };
}

export default async function ChartPage({ searchParams }: Props) {
  // default values
  const category = (searchParams?.category as any) || "songs";
  const region = (searchParams?.region as any) || "global";
  const sort = (searchParams?.sort as any) || "this-week";
  const limit = parseInt(searchParams?.limit || "50", 10);

  // Validate category
  if (!["songs", "albums", "videos"].includes(category)) {
    // fallback to songs
    (category as any) = "songs";
  }

  // Fetch server-side initial chart data
  let initialData: ChartItem[] = [];
  try {
    initialData = await getCharts({
      category: category as "songs" | "albums" | "videos",
      region,
      sort: sort as "this-week" | "last-week" | "all-time",
      limit,
    });
    console.log("CHART_DATA",initialData)
  } catch (err) {
    console.error("Failed to load chart data:", err);
  }

  // Render client chart component with initial data & applied filters
  // IndexChart should accept props: data: ChartItem[], initialFilters?: { category, region, sort }
  return (
    <IndexChart/>
  );
}
