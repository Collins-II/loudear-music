import React from "react";
import ClientIndex from "./components/ClientIndex";
import { getUserSongs } from "@/actions/getUserSongs";

export const dynamic = "force-dynamic";

export default async function SongsPage() {
  const songs = await getUserSongs();

   const serializedSongs = JSON.parse(JSON.stringify(songs));

  return (
    <ClientIndex data={serializedSongs} />
  )
}