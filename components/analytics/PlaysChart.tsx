// components/analytics/PlaysChart.tsx
import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type Point = { date: string; plays: number };

export function PlaysChart({ series, loading }: { series: Point[]; loading?: boolean }) {
  if (loading) return <div className="h-80 flex items-center justify-center text-sm">Loading chart…</div>;

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series}>
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#111827" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#111827" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Area type="monotone" dataKey="plays" stroke="#111827" fill="url(#g1)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
