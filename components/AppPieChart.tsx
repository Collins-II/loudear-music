"use client";

import { useTheme } from "next-themes";
import { useMemo } from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { TrendingUp } from "lucide-react";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
  },
  mobile: {
    label: "Mobile",
  },
  tablet: {
    label: "Tablet",
  },
  other: {
    label: "Other",
  },
} satisfies ChartConfig;

// Dummy device usage data
const baseData = [
  { device: "desktop", visitors: 450 },
  { device: "mobile", visitors: 320 },
  { device: "tablet", visitors: 180 },
  { device: "other", visitors: 90 },
];

export default function AppPieChart() {
  const { theme } = useTheme();

  // Dynamically assign fill colors based on theme
  const chartData = useMemo(() => {
    const colorsLight = {
      desktop: "#4f46e5",
      mobile: "#06b6d4",
      tablet: "#f97316",
      other: "#10b981",
    };
    const colorsDark = {
      desktop: "#818cf8",
      mobile: "#22d3ee",
      tablet: "#fb923c",
      other: "#34d399",
    };
    const colors = theme === "dark" ? colorsDark : colorsLight;

    return baseData.map((d) => ({ ...d, fill: colors[d.device as keyof typeof colors] }));
  }, [theme]);

  const totalVisitors = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.visitors, 0),
    [chartData]
  );

  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">Device Usage</h1>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="visitors"
            nameKey="device"
            innerRadius={60}
            strokeWidth={5}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {totalVisitors.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        Visitors
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="mt-4 flex flex-col gap-2 items-center">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 4.8% this month <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors by device for the last 6 months
        </div>
      </div>
    </div>
  );
}
