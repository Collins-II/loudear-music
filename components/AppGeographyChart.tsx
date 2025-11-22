"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { motion } from "framer-motion";
import io from "socket.io-client";

type GeoData = {
  country: string;
  value: number;
};

type ApiResponse = {
  geo: GeoData[];
};

// SWR fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Dummy data for initial display
const DUMMY_DATA: GeoData[] = [
  { country: "South Africa", value: 120 },
  { country: "Malawi", value: 80 },
  { country: "Nigeria", value: 60 },
  { country: "UK", value: 50 },
  { country: "United States", value: 40 },
  { country: "Ghana", value: 30 },
  { country: "Tanzania", value: 25 },
];

// Color palette for countries
const COLORS = ["#bbb7f7", "#a6e9f5", "#f7caab", "#f3a0a0", "#9ff1d6", "#b89ff3", "#f099a7"];

export default function GeographyChart() {
  // SWR fetching
  const { data, error, isLoading } = useSWR<ApiResponse>("/api/analytics/audience", fetcher, {
    revalidateOnFocus: false,
  });

  // State: default to dummy data
  const [chartData, setChartData] = useState<GeoData[]>(DUMMY_DATA);

  // Update chart when SWR data comes in
  useEffect(() => {
    if (data?.geo && data.geo.length > 0) {
      setChartData(data.geo);
    }
  }, [data]);

  // Real-time updates via WebSocket
  useEffect(() => {
    const socket = io();

    socket.on("connect", () => console.log("✅ Connected to socket server:", socket.id));

    socket.on("geo:update", (payload: GeoData[]) => {
      setChartData(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <h1 className="text-lg font-medium mb-6">Audience Geography</h1>

      {isLoading && <div className="h-[200px] w-full animate-pulse bg-muted rounded-xl"></div>}

      {!isLoading && error && (
        <p className="text-red-500 text-sm">Failed to load geography data...</p>
      )}

      {chartData.length > 0 && (
        <div className="h-[250px] w-full">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="country"
                outerRadius={80}
                label
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
