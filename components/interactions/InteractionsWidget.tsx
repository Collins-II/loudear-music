import { socket } from "@/lib/socketClient";
import { useEffect, useState } from "react";

export default function InteractionWidget({ id }: { id: string }) {
  const [counts, setCounts] = useState({ likes: 0, shares: 0, downloads: 0, views: 0 });

  useEffect(() => {
    socket.emit("join", id);

    socket.on("interaction:update", (data) => {
      if (data.id === id) {
        setCounts(data.counts);
      }
    });

    return () => {
      socket.off("interaction:update");
    };
  }, [id]);

  return (
    <div>
      <button>👍 {counts.likes}</button>
      <button>🔗 {counts.shares}</button>
      <button>⬇️ {counts.downloads}</button>
      <button>👀 {counts.views}</button>
    </div>
  );
}
