import { getAlbums } from "@/app/actions/getAlbums";
import React from "react";
import AlbumsIndex from "./components/ClientIndex";

export default async function AlbumsPage() {
  const albums = await getAlbums();

  return (
    <AlbumsIndex data={albums} />
  )
}