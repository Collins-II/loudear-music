import React from "react";
import AlbumsIndex from "./components/ClientIndex";
import { getUserAlbums } from "@/actions/getUserAlbums";

export default async function AlbumsPage() {
  const albums = await getUserAlbums();
  const serializedAlbums = JSON.parse(JSON.stringify(albums));

  return (
    <AlbumsIndex data={serializedAlbums} />
  )
}