// components/analytics/GeoTable.tsx
import React from "react";

export function GeoTable({ items = [], loading = false }: { items?: {country:string,code:string,plays:number}[]; loading?: boolean }) {
  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="space-y-2">
      {items.map((c, idx) => (
        <div key={c.code} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 text-sm font-semibold">{idx+1}</div>
            <div>
              <div className="font-medium">{c.country}</div>
              <div className="text-xs text-muted-foreground">{c.code}</div>
            </div>
          </div>
          <div className="font-mono">{c.plays}</div>
        </div>
      ))}
    </div>
  );
}
