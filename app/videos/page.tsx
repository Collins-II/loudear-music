import React from "react";
import IndexVideo from "./components/IndexVideo";
import { getCharts } from "@/actions/getCharts";

export default async function VideoPage() {
  const videos = await getCharts({
            category: "videos",
            region: "global",
            sort: "all-time",
            limit: 200,
          });;

  return (
      <IndexVideo videos={videos} />
  );
}