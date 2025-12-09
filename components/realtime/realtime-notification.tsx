"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export default function RealtimeNotifications() {
  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);

    ws.onopen = () => console.log("Notifications WS connected");

    ws.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data);

        switch (event.type) {
          case "song:new":
            toast.success(`📀 New Song: ${event.data.title}`, {
              description: `By ${event.data.artist}`,
              duration: 6000,
            });
            break;

          case "video:new":
            toast.success(`🎬 New Video: ${event.data.title}`, {
              description: `By ${event.data.artist}`,
              duration: 6000,
            });
            break;

          case "media:update":
            toast(`✏️ Updated: ${event.data.title}`, {
              description: "Metadata was updated",
            });
            break;

          case "notify:global":
            toast(`📢 Announcement`, {
              description: event.message,
              duration: 7000,
            });
            break;

          case "notify:user":
            // Only show if this event is for the signed-in user
            if (event.userId === window.__USER_ID__) {
              toast.success(`🔔 Notification`, {
                description: event.message,
                duration: 7000,
              });
            }
            break;
        }
      } catch (err) {
        console.error("Failed to parse WS message", err);
      }
    };

    ws.onclose = () => console.warn("Notification WS disconnected");

    return () => ws.close();
  }, []);

  return null;
}
