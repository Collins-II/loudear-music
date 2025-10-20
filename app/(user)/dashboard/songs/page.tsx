import React from "react";
import { getSongs } from "@/app/actions/getSongs";
import ClientIndex from "./components/ClientIndex";


export default async function SongsPage() {
  const songs = await getSongs();

  return (
    <ClientIndex data={songs} />
  )
}