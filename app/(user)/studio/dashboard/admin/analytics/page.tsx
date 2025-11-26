// app/artist/[id]/analytics/page.tsx
"use client";

import React from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OverviewGrid } from "@/components/analytics/OverviewGrid";
import { PlaysChart } from "@/components/analytics/PlaysChart";
import { TopTracksTable } from "@/components/analytics/TopTracksTable";
import { GeoTable } from "@/components/analytics/GeoTable";
import { RealtimePlays } from "@/components/analytics/RealtimePlays";
import { fetcher } from "@/lib/utils";
import type { ArtistAnalyticsResponse } from "@/types/analytics";

export default function ArtistAnalyticsPage() {
  const params = useParams();
  const artistId = params?.id ?? "me";

  const { data, error, isLoading } = useSWR<ArtistAnalyticsResponse>(
    `/api/artist/${artistId}/analytics`,
    fetcher,
    { refreshInterval: 30_000 }
  );

  return (
    <main className="min-h-screen bg-background text-black dark:text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">Artist Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Insights for your music — plays, listeners, revenue and trends.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Export CSV</Button>
            <Button size="sm">Export PDF</Button>
          </div>
        </div>

        {/* Data not loaded / error */}
        {error && (
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
            <CardContent>
              <div className="text-red-700 dark:text-red-200">Failed to load analytics.</div>
            </CardContent>
          </Card>
        )}

        {/* Overview */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <OverviewGrid data={data?.overview} loading={isLoading} />
        </motion.div>

        {/* Charts + Realtime + Geo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plays (last 30 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <PlaysChart series={data?.timeseries ?? []} loading={isLoading} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Tracks</CardTitle>
              </CardHeader>
              <CardContent>
                <TopTracksTable items={data?.topTracks ?? []} loading={isLoading} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Realtime Plays</CardTitle>
              </CardHeader>
              <CardContent>
                <RealtimePlays artistId={artistId as string} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <GeoTable items={data?.geo ?? []} loading={isLoading} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
