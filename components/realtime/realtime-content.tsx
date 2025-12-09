"use client";

import { useEffect, useState } from "react";
import LatestSection from "@/components/LatestSection";
import { getSocket } from "@/lib/socketClient";

export default function RealtimeContent({ initialSongs, initialVideos }: any) {
  const [songs, setSongs] = useState(initialSongs);
  const [videos, setVideos] = useState(initialVideos);

  const socket = getSocket();

  useEffect(() => {
    // CONNECTED
    socket.on("connect", () => {
      console.log("🔌 Realtime connected:", socket.id);
    });

    // NEW SONG/VIDEO CREATED
    socket.on("media:create", (payload: any) => {
      if (payload.type === "song") {
        setSongs((prev: any) => [payload.data, ...prev]);
      } else if (payload.type === "video") {
        setVideos((prev: any) => [payload.data, ...prev]);
      }
    });

    // SONG/VIDEO UPDATED
    socket.on("media:update", (payload: any) => {
      setSongs((prev: any) =>
        prev.map((m: any) => (m._id === payload.data._id ? payload.data : m))
      );

      setVideos((prev: any) =>
        prev.map((m: any) => (m._id === payload.data._id ? payload.data : m))
      );
    });

    // DISCONNECTED
    socket.on("disconnect", () => {
      console.warn("⚠ Realtime disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("media:create");
      socket.off("media:update");
      socket.off("disconnect");
    };
  }, [socket]);

  return <LatestSection songs={songs} videos={videos} />;
}
