"use client"

import { useMemo } from "react"
import {
  Telescope,
  Clock,
  Camera,
  Target,
  Moon,
  Sparkles,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { INITIAL_LOG, type LogEntry } from "@/lib/log"

interface StatCard {
  label: string
  value: string
  hint: string
  icon: typeof Telescope
}

function buildStats(entries: LogEntry[]): StatCard[] {
  const sessions = entries.filter((e) => e.kind === "session")
  const totalMinutes = sessions.reduce((sum, e) => sum + e.totalIntegration, 0)
  const totalFrames = entries.reduce((sum, e) => sum + e.frameCount, 0)
  const uniqueTargets = new Set(sessions.map((e) => e.target)).size
  const darkestSqm = sessions.reduce(
    (max, e) => (e.sqm > max ? e.sqm : max),
    0,
  )

  return [
    {
      label: "Total Integration",
      value: `${(totalMinutes / 60).toFixed(1)} h`,
      hint: `${totalMinutes.toLocaleString()} minutes captured`,
      icon: Clock,
    },
    {
      label: "Imaging Sessions",
      value: sessions.length.toString(),
      hint: `across ${uniqueTargets} unique targets`,
      icon: Telescope,
    },
    {
      label: "Frames Logged",
      value: totalFrames.toLocaleString(),
      hint: `lights, darks, flats & bias`,
      icon: Camera,
    },
    {
      label: "Unique Targets",
      value: uniqueTargets.toString(),
      hint: `deep-sky objects imaged`,
      icon: Target,
    },
    {
      label: "Darkest Sky",
      value: `${darkestSqm.toFixed(2)}`,
      hint: `best SQM mag/arcsec²`,
      icon: Moon,
    },
    {
      label: "Avg. Exposure",
      value: sessions.length
        ? `${Math.round(
            sessions.reduce((s, e) => s + e.exposure, 0) / sessions.length,
          )} s`
        : "—",
      hint: `mean sub-frame length`,
      icon: Sparkles,
    },
  ]
}

const integrationConfig = {
  minutes: { label: "Integration (min)", color: "var(--chart-1)" },
} satisfies ChartConfig

const filterConfig = {
  count: { label: "Frames" },
} satisfies ChartConfig

export function AnalyticsView() {
  const entries = INITIAL_LOG

  const stats = useMemo(() => buildStats(entries), [entries])

  const integrationByTarget = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of entries.filter((e) => e.kind === "session")) {
      map.set(e.target, (map.get(e.target) ?? 0) + e.totalIntegration)
    }
    return Array.from(map, ([target, minutes]) => ({ target, minutes }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 6)
  }, [entries])

  const framesByFilter = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of entries) {
      map.set(e.filter, (map.get(e.filter) ?? 0) + e.frameCount)
    }
    return Array.from(map, ([filter, count], i) => ({
      filter,
      count,
      fill: `var(--chart-${(i % 5) + 1})`,
    })).sort((a, b) => b.count - a.count)
  }, [entries])

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-1">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
          <Badge variant="secondary">Preview</Badge>
        </div>
        <p className="text-sm text-muted-foreground text-pretty">
          Interesting facts pulled from your astrophotography log. More insights
          coming soon.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="gap-1 pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">{s.label}</CardDescription>
                <s.icon className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl tabular-nums">{s.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground text-pretty">
                {s.hint}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Targets by Integration</CardTitle>
            <CardDescription>
              Total minutes captured per deep-sky object
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={integrationConfig} className="h-64 w-full">
              <BarChart
                accessibilityLayer
                data={integrationByTarget}
                layout="vertical"
                margin={{ left: 12, right: 12 }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="target"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={120}
                  tickMargin={8}
                />
                <XAxis dataKey="minutes" type="number" hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="minutes"
                  fill="var(--color-minutes)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frames by Filter</CardTitle>
            <CardDescription>
              Distribution of captured frames across filters
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer
              config={filterConfig}
              className="mx-auto aspect-square h-64"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="filter" />} />
                <Pie
                  data={framesByFilter}
                  dataKey="count"
                  nameKey="filter"
                  innerRadius={50}
                  strokeWidth={2}
                >
                  {framesByFilter.map((entry) => (
                    <Cell key={entry.filter} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
