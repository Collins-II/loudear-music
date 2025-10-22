"use client"

import { useEffect, useState } from "react"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Metrics {
  revenue: number
  customers: number
  activeAccounts: number
  growthRate: number
  trends: {
    revenue: number
    customers: number
    activeAccounts: number
    growthRate: number
  }
}

export function SectionCards() {
  const [metrics, setMetrics] = useState<Metrics>({
    revenue: 0,
    customers: 0,
    activeAccounts: 0,
    growthRate: 0,
    trends: { revenue: 0, customers: 0, activeAccounts: 0, growthRate: 0 },
  })

  // 🔄 Fetch metrics from API (simulate with timeout for demo)
  useEffect(() => {
    async function fetchMetrics() {
      try {
        // Example: call your backend endpoint (replace with real API)
        // const res = await fetch("/api/dashboard/metrics")
        // const data = await res.json()

        // Simulated data
        const data = {
          revenue: 1250,
          customers: 1234,
          activeAccounts: 45678,
          growthRate: 4.5,
          trends: {
            revenue: 12.5,
            customers: -20,
            activeAccounts: 12.5,
            growthRate: 4.5,
          },
        }

        setMetrics(data)
      } catch (error) {
        console.error("Failed to fetch metrics:", error)
      }
    }

    fetchMetrics()

    // Optional: auto-refresh every 30s
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  const { revenue, customers, activeAccounts, growthRate, trends } = metrics

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-4 @5xl/main:grid-cols-4">
      {/* Total Revenue */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${revenue.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {trends.revenue >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {trends.revenue >= 0 ? `+${trends.revenue}%` : `${trends.revenue}%`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {trends.revenue >= 0 ? (
              <>
                Trending up this month <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                Trending down this month <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            Visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>

      {/* New Customers */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Followers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {customers.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {trends.customers >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {trends.customers >= 0
                ? `+${trends.customers}%`
                : `${trends.customers}%`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {trends.customers >= 0 ? (
              <>
                Growing customer base <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                Down {Math.abs(trends.customers)}% this period{" "}
                <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            Acquisition {trends.customers >= 0 ? "is strong" : "needs attention"}
          </div>
        </CardFooter>
      </Card>

      {/* Active Accounts */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Fans</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {activeAccounts.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {trends.activeAccounts >= 0 ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {trends.activeAccounts >= 0
                ? `+${trends.activeAccounts}%`
                : `${trends.activeAccounts}%`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {trends.activeAccounts >= 0 ? (
              <>
                Strong user retention <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                Retention decline <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            Engagement{" "}
            {trends.activeAccounts >= 0 ? "exceeds targets" : "below target"}
          </div>
        </CardFooter>
      </Card>

      {/* Growth Rate */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {growthRate.toFixed(1)}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {trends.growthRate >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {trends.growthRate >= 0
                ? `+${trends.growthRate}%`
                : `${trends.growthRate}%`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {trends.growthRate >= 0 ? (
              <>
                Steady performance increase <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                Growth slowdown <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            Meets growth projections
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
