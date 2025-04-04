'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { SessionsChartData } from '@/interfaces/analytics';
import { cn } from '@/utils/classNames';

interface SessionsChartProps {
  className?: string,
  data: SessionsChartData[],
}

export default function SessionsChart({ className, data = [] }: SessionsChartProps) {
  // Format data for the chart and ensure all dates are included
  const formatChartData = (data: SessionsChartData[]) => {
    if (!data || data.length === 0) return []

    // Convert all dates to Date objects
    const datesWithData = data.map((item) => ({
      date: item.date instanceof Date ? item.date : new Date(item.date),
      seconds: item.seconds,
    }))

    // Find min and max dates
    const sortedDates = [...datesWithData].sort((a, b) => a.date.getTime() - b.date.getTime())
    const minDate = sortedDates[0].date
    const maxDate = sortedDates[sortedDates.length - 1].date

    // Create array of all dates between min and max
    const allDates: { date: Date; seconds: number }[] = []
    const currentDate = new Date(minDate)

    while (currentDate <= maxDate) {
      allDates.push({
        date: new Date(currentDate),
        seconds: 0, // Default value
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Map data to the complete date range
    const dataMap = new Map(datesWithData.map((item) => [item.date.toISOString().split("T")[0], item.seconds]))

    // Create final dataset with all dates
    return allDates.map((item) => {
      const dateKey = item.date.toISOString().split("T")[0]
      return {
        date: dateKey,
        seconds: dataMap.get(dateKey) || 0,
        minutes: Math.round((dataMap.get(dateKey) || 0) / 60),
      }
    })
  }

  // Process the data
  const chartData = formatChartData(data)

  // Chart configuration
  const chartConfig = {
    seconds: {
      label: "Session Duration",
      color: "hsl(var(--chart-1))",
    },
  }

  // Format seconds to a readable duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-medium">Session Duration</h3>
        <p className="text-sm text-muted-foreground">Time spent in sessions by date</p>
      </div>

      <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
        <BarChart accessibilityLayer data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 24 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `${Math.round(value / 60)}m`}
          />
          <Bar dataKey="seconds" fill="var(--color-seconds)" radius={[4, 4, 0, 0]} name="Duration" />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                }}
                formatter={(value, name) => {
                  if (name === "seconds") {
                    return formatDuration(Number(value))
                  }
                  return value
                }}
              />
            }
            cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
          />
        </BarChart>
      </ChartContainer>
    </Card>
  )
}

