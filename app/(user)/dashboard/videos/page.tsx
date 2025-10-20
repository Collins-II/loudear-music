
import React from "react";
import VideosIndex from "./components/ClientIndex";
import { getVideos } from "@/app/actions/getVideos";

export default async function VideosPage() {
  const videos = await getVideos();

  return (
    <VideosIndex data={videos} />
  )
}