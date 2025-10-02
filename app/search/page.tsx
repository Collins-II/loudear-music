import React from "react";
import IndexSearch from "./components/IndexSearch";
import { getVideos } from "@/actions/getVideos";
import { getSongs } from "@/actions/getSongs";
import { getAllAlbums } from "@/actions/getAlbums";

export default async function VideoPage() {
  const videos = await getVideos();
  const songs = await getSongs();
  const albums = await getAllAlbums();

  return (
      <IndexSearch />
  );
}