// components/analytics/TopTracksTable.tsx
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function TopTracksTable({ items = [], loading = false }: { items?: any[]; loading?: boolean }) {
  if (loading) return <div className="p-6">Loading tracks…</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-muted-foreground">
            <th className="py-2">#</th>
            <th>Track</th>
            <th className="text-right">Plays</th>
            <th className="text-right">Listeners</th>
            <th className="text-right">Revenue</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((t, i) => (
            <tr key={t.id} className="border-b last:border-b-0">
              <td className="py-3 w-10">{i+1}</td>
              <td className="flex items-center gap-3 py-3">
                <div className="w-12 h-12 relative rounded overflow-hidden bg-neutral-100">
                  <Image src={t.image} alt={t.title} fill className="object-cover" />
                </div>
                <div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-xs text-muted-foreground">Duration: {Math.floor(t.duration/60)}:{(t.duration%60).toString().padStart(2,"0")}</div>
                </div>
              </td>
              <td className="text-right font-mono">{t.plays}</td>
              <td className="text-right">{t.listeners}</td>
              <td className="text-right">{(t.revenueCents/100).toFixed(2)}</td>
              <td className="text-right">
                <Button size="sm" variant="outline">Details</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
