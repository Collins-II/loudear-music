// components/analytics/OverviewGrid.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Users, DollarSign } from "lucide-react";

type Overview = {
  playsToday: number;
  listenersToday: number;
  revenueCents: number;
  plays30d: number;
} | undefined;

export function OverviewGrid({ data, loading }: { data?: Overview; loading?: boolean }) {
  const formatCurrency = (c?: number) => (c ? `$${(c/100).toFixed(2)}` : "$0.00");

  const items = [
    { key: "playsToday", title: "Plays Today", icon: <Play className="w-5 h-5"/>, value: data?.playsToday ?? 0 },
    { key: "listenersToday", title: "Listeners Today", icon: <Users className="w-5 h-5"/>, value: data?.listenersToday ?? 0 },
    { key: "revenue", title: "Revenue (30d)", icon: <DollarSign className="w-5 h-5"/>, value: formatCurrency(data?.revenueCents) },
    { key: "plays30d", title: "Plays (30d)", icon: <Play className="w-5 h-5"/>, value: data?.plays30d ?? 0 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((it) => (
        <Card key={it.key}>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-sm">{it.title}</CardTitle>
            <div className="text-muted-foreground">{it.icon}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "—" : it.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
