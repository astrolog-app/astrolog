"use client"

import { Telescope, Clock, Layers, Crosshair, CalendarDays, BarChart3 } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Badge } from "@/components/ui/badge"
import { EquipmentNotes } from "@/components/equipment/equipment-notes"
import { computeEquipmentStats, getCategory, type EquipmentItem, type EquipmentNote } from "@/lib/equipment"
import { INITIAL_LOG } from "@/lib/log"

const monthlyConfig = {
  hours: { label: "Hours", color: "var(--chart-1)" },
} satisfies ChartConfig

function PreviewLabel() {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="uppercase tracking-wide">
        Preview
      </Badge>
    </div>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-lg font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  )
}

export function EquipmentAnalytics({
  item,
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}: {
  item: EquipmentItem | null
  notes: EquipmentNote[]
  onAddNote: (text: string) => void
  onUpdateNote: (id: string, text: string) => void
  onDeleteNote: (id: string) => void
}) {
  if (!item) {
    return (
      <div className="flex h-full flex-col gap-3">
        <PreviewLabel />
        <Empty className="flex-1 rounded-lg border border-dashed border-border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BarChart3 />
            </EmptyMedia>
            <EmptyTitle>No item selected</EmptyTitle>
            <EmptyDescription>Select an equipment item to see its preview.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  const stats = computeEquipmentStats(item, INITIAL_LOG)
  const category = getCategory(item.category)
  const formatMonth = (m: string) => {
    const [y, mo] = m.split("-")
    return new Date(Number(y), Number(mo) - 1).toLocaleDateString("en-US", { month: "short" })
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-1">
      <PreviewLabel />
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{item.name}</h2>
          <Badge variant="secondary">{category.noun}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{item.brand || "—"}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatTile icon={Telescope} label="Sessions" value={String(stats.sessions)} />
        <StatTile icon={Clock} label="Integration" value={`${stats.integrationHours} h`} />
        <StatTile icon={Layers} label="Frames" value={String(stats.frames)} />
        <StatTile icon={Crosshair} label="Targets" value={String(stats.uniqueTargets)} />
      </div>

      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <CalendarDays className="size-4" />
        <span>Last used: </span>
        <span className="font-medium text-foreground">{stats.lastUsed ?? "Never"}</span>
      </div>

      {stats.sessions === 0 ? (
        <Empty className="flex-1 rounded-lg border border-dashed border-border">
          <EmptyHeader>
            <EmptyTitle>No imaging data yet</EmptyTitle>
            <EmptyDescription>This item hasn&apos;t been used in any logged session.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <Card className="shrink-0">
            <CardHeader>
              <CardTitle className="text-sm">Monthly integration</CardTitle>
              <CardDescription>Hours captured per month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={monthlyConfig} className="h-40 w-full">
                <BarChart accessibilityLayer data={stats.monthly}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={formatMonth} />
                  <YAxis tickLine={false} axisLine={false} width={28} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="hours" fill="var(--color-hours)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shrink-0">
            <CardHeader>
              <CardTitle className="text-sm">Top targets</CardTitle>
              <CardDescription>Most-imaged with this item</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-2 text-sm">
                {stats.topTargets.map((t) => (
                  <div key={t.target} className="flex items-center justify-between gap-2">
                    <dt className="truncate text-foreground">{t.target}</dt>
                    <dd className="shrink-0 font-medium tabular-nums text-muted-foreground">
                      {Math.round((t.minutes / 60) * 10) / 10} h
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </>
      )}

      <EquipmentNotes notes={notes} onAdd={onAddNote} onUpdate={onUpdateNote} onDelete={onDeleteNote} />
    </div>
  )
}
