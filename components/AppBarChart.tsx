"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

type GeoData = {
  country: string;
  listeners: number;
};

const chartConfig = {
  listeners: {
    label: "Listeners",
  },
} satisfies ChartConfig;

// Dummy geographic listeners data
const baseData: GeoData[] = [
  { country: "Zambia", listeners: 450 },
  { country: "Nigeria", listeners: 320 },
  { country: "South Africa", listeners: 210 },
  { country: "USA", listeners: 180 },
  { country: "UK", listeners: 150 },
  { country: "Malawi", listeners: 120 },
  { country: "Ghana", listeners: 90 },
];

export default function AppBarChart() {
  const { theme } = useTheme();

  const chartData = useMemo(() => {
    const color = theme === "dark" ? "#818cf8" : "#4f46e5"; // Dark/light mode color
    return baseData.map((d) => ({ ...d, fill: color }));
  }, [theme]);

  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">Geographical Listeners</h1>
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} strokeOpacity={0.1} />
          <XAxis
            dataKey="country"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="listeners"
            radius={4}
            fill={chartData[0]?.fill || "#4f46e5"}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
