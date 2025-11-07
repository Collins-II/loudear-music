
import React from "react";
import VideosIndex from "./components/ClientIndex";
import { getUserVideos } from "@/actions/getUserVideos";

export const dynamic = "force-dynamic";

export default async function VideosPage() {
  const videos = await getUserVideos();
  const serializedVideos = JSON.parse(JSON.stringify(videos));
  
  return (
    <VideosIndex data={serializedVideos} />
  )
}