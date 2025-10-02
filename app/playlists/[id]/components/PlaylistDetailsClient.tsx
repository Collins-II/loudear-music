// app/playlists/[id]/PlaylistDetailsClient.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TopPlaylist } from "@/components/playlists/TopPlaylist";
import { Playlist } from "../../page";
import Image from "next/image";

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
}

interface PlaylistDetail {
  id: string;
  title: string;
  curator: string;
  image: string;
  description?: string;
  tracks: Track[];
  genre: string;
}

interface Props {
  playlist: PlaylistDetail;
  relatedPlaylist: Playlist[];
}

export default function PlaylistDetailsClient({
  playlist,
  relatedPlaylist,
}: Props) {
  if (!playlist)
    return (
      <div className="flex items-center justify-center h-screen text-xl font-bold">
        Playlist not found
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white via-gray-50 to-gray-100 text-gray-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 px-4 md:px-8 lg:px-12 py-16">
        {/* LEFT */}
        <div className="lg:col-span-2 pt-8">
          <div className="bg-blue-200 h-20 flex items-center justify-center rounded-lg mb-8">
            <span className="text-gray-500">Advertisement</span>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative flex flex-col md:flex-row items-center md:items-end gap-6"
          >
            <div className="relative w-full h-48 md:w-64 md:h-64 rounded-xl overflow-hidden shadow-xl border border-gray-200">
              <Image
                src={playlist.image}
                alt={playlist.title}
                fill
                className="object-cover w-full h-full"
              />
            </div>

            <div className="flex flex-col gap-3 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                {playlist.title}
              </h1>
              <p className="text-gray-600">
                Curated by <span className="text-2xl font-medium text-black capitalize">{playlist.curator}</span>
              </p>
              {playlist.description && (
                <p className="text-gray-500">{playlist.description}</p>
              )}
            </div>
          </motion.div>

          {/* Spotify Embed Player */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-8"
          >
            <iframe
              src={`https://open.spotify.com/embed/playlist/${playlist.id}`}
              width="100%"
              height="620"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl shadow-lg"
            />
          </motion.div>
        </div>

        {/* RIGHT */}
        <aside className="space-y-8 mt-6">
          <div className="bg-blue-200 h-20 flex items-center justify-center rounded-lg mb-4">
            <span className="text-gray-500">Advertisement</span>
          </div>

          <div>
            <h3 className="relative text-slate-900 text-xl font-bold mb-3 tracking-tight">
              <span className="relative z-10 bg-white pr-3">
                Related Playlists
              </span>
              <span className="absolute left-0 top-1/2 w-full h-[4px] bg-black -z-0"></span>
            </h3>
            <div className="space-y-4">
              {relatedPlaylist?.map((pl, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-black">
                    {i + 1}
                  </span>
                  <TopPlaylist
                    id={pl.id}
                    title={pl.title}
                    curator={pl.curator}
                    image={pl.image}
                    plays={pl.plays as number}
                  />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
