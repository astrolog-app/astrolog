"use client"

import styles from "./equipmentChart.module.scss"
import { Label, Pie, PieChart } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { CameraSVG, MountSVG, TelescopeSVG } from "@/public/svgs"
import { PieChartData, sampleAnalytics } from '@/interfaces/analytics';

const processChartData = (data: PieChartData[]) => {
  return data.map((item, index) => ({
    ...item,
    fill: `hsl(var(--chart-${(index % 12) + 1}))`,
  }))
}

const equipmentChartData = sampleAnalytics.equipment_chart;
const mountsData = processChartData(equipmentChartData.mounts)
const telescopesData = processChartData(equipmentChartData.telescopes)
const camerasData = processChartData(equipmentChartData.cameras)

const chartConfig: ChartConfig = {
  value: {
    label: "Value",
  },
  ...Object.fromEntries(
    Array.from({ length: 12 }, (_, i) => i + 1).map((num) => [
      num.toString(),
      {
        label: `Item ${num}`,
        color: `hsl(var(--chart-${num}))`,
      },
    ]),
  ),
}

export function EquipmentChart({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="items-center pb-0">
        <CardTitle>Astronomy Equipment Usage</CardTitle>
        <CardDescription>Popular equipment choices</CardDescription>
      </CardHeader>
      <CardContent className={styles.content}>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px] min-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={telescopesData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className={styles.svg}>
                          <TelescopeSVG />
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          Telescopes
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px] min-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={camerasData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          <CameraSVG />
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          Cameras
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px] min-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={mountsData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          <MountSVG />
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          Mounts
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">Showing equipment popularity based on user data</div>
      </CardFooter>
    </Card>
  )
}

