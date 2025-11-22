"use client";

import useSWR from "swr";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useTheme } from "next-themes";

type VisitorData = {
  month: string;
  desktop: number;
  mobile: number;
};

type ApiResponse = {
  visitors: VisitorData[];
};

// -----------------
// Dummy Data
// -----------------
const DUMMY_DATA: VisitorData[] = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 173, mobile: 100 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

// -----------------
// Chart Config
// -----------------
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-2)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

// -----------------
// SWR Fetcher
// -----------------
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// -----------------
// AppAreaChart Component
// -----------------
export default function AppAreaChart() {
  const { theme } = useTheme();

  const { data, error, isLoading } = useSWR<ApiResponse>(
    "/api/analytics/visitors",
    fetcher,
    { revalidateOnFocus: false }
  );

  // Use dummy data as default
  const [chartData, setChartData] = useState<VisitorData[]>(DUMMY_DATA);

  // -----------------
  // WebSocket real-time updates
  // -----------------
  useEffect(() => {
    const socket = io();

    socket.on("connect", () => {
      console.log("✅ Connected to socket server:", socket.id);
    });

    socket.on("stan:update", (payload: VisitorData) => {
      setChartData((prev) => {
        const exists = prev.find((v) => v.month === payload.month);
        if (exists) {
          return prev.map((v) => (v.month === payload.month ? payload : v));
        }
        return [...prev, payload];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Update chart data when SWR fetches new data
  useEffect(() => {
    if (data?.visitors && data.visitors.length > 0) {
      setChartData(data.visitors);
    }
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <h1 className="text-lg font-medium mb-6">Total Visitors</h1>

      {isLoading && <div className="h-[200px] w-full animate-pulse bg-muted rounded-xl" />}

      {!isLoading && error && (
        <p className="text-red-500 text-sm">Failed to load analytics...</p>
      )}

      {chartData.length > 0 && (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <AreaChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} strokeOpacity={0.1} />

            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(v) => v.slice(0, 3)}
            />

            <YAxis tickLine={false} tickMargin={10} axisLine={false} />

            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />

            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={theme === "dark" ? "#818cf8" : "var(--color-desktop)"}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={theme === "dark" ? "#818cf8" : "var(--color-desktop)"}
                  stopOpacity={0.1}
                />
              </linearGradient>

              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={theme === "dark" ? "#06b6d4" : "var(--color-mobile)"}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={theme === "dark" ? "#06b6d4" : "var(--color-mobile)"}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              fillOpacity={0.4}
              stroke="var(--color-mobile)"
              stackId="a"
            />

            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      )}
    </motion.div>
  );
}
