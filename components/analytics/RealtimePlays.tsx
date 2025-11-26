// components/analytics/RealtimePlays.tsx
"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
// This is a stub - integrate with your Socket.IO backend or SSE for real-time updates
export function RealtimePlays({ artistId }: { artistId: string }) {
  const [events, setEvents] = useState<{id:string, title:string, time:string}[]>([]);

  useEffect(() => {
    // Mock incoming events every 4-8s
    let mounted = true;
    const tick = () => {
      if (!mounted) return;
      setEvents((s) => {
        const next = [{ id: String(Date.now()), title: `Track ${Math.ceil(Math.random()*6)}`, time: new Date().toLocaleTimeString() }, ...s].slice(0,8);
        return next;
      });
    };
    const id = setInterval(tick, 4500 + Math.random()*3000);
    return () => { mounted=false; clearInterval(id); };
  }, [artistId]);

  return (
    <div className="space-y-2">
      {events.length === 0 ? (
        <div className="text-sm text-muted-foreground">No live plays yet.</div>
      ) : (
        events.map((e) => (
          <motion.div key={e.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between">
            <div className="text-sm">{e.title}</div>
            <div className="text-xs text-muted-foreground">{e.time}</div>
          </motion.div>
        ))
      )}
    </div>
  );
}
