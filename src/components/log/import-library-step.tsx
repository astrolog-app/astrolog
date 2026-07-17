"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { api } from "@/lib/api"
import { useAppState } from "@/context/state-provider"
import { cn } from "@/lib/utils"
import type { BiasFrameRow, DarkFrameRow } from "@/types/imaging-frames"
import type { UUID } from "crypto"
import { Layers, Moon } from "lucide-react"

// stable identity for a grouped library row so selections survive re-renders
function biasKey(r: BiasFrameRow): string {
  return `bias:${r.camera_id}:${r.gain}:${r.binning}:${r.offset ?? "x"}:${r.night}`
}
function darkKey(r: DarkFrameRow): string {
  return `dark:${r.camera_id}:${r.gain}:${r.binning}:${r.offset ?? "x"}:${r.exposure_ms}:${r.sensor_temp ?? "x"}:${r.night}`
}

export interface LibrarySelection {
  bias: string[]
  darks: string[]
}

export function ImportLibraryStep({
  cameraId,
  includeDarks,
  selection,
  onChange,
}: {
  // only calibration matching the session camera is offered
  cameraId: string
  // cooled cameras pull darks from the library; DSLRs imported them from files
  includeDarks: boolean
  selection: LibrarySelection
  onChange: (next: LibrarySelection) => void
}) {
  const { appState } = useAppState()
  const [biasRows, setBiasRows] = useState<BiasFrameRow[]>([])
  const [darkRows, setDarkRows] = useState<DarkFrameRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      api.getBiasFrames({ search: null, sort_by: "night", sort_dir: "desc", limit: 1000, offset: 0 }),
      includeDarks
        ? api.getDarkFrames({ search: null, sort_by: "night", sort_dir: "desc", limit: 1000, offset: 0 })
        : Promise.resolve({ rows: [], total: 0 }),
    ])
      .then(([bias, dark]) => {
        if (cancelled) return
        setBiasRows(bias.rows)
        setDarkRows(dark.rows)
      })
      .catch((err) => console.error("failed to load calibration library", err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [includeDarks])

  const cameraName = (id: UUID) => appState?.equipment.cameras[id]?.name ?? "Unknown camera"

  // only offer calibration shot with the same camera as the session
  const bias = useMemo(
    () => biasRows.filter((r) => r.camera_id === (cameraId as UUID)),
    [biasRows, cameraId],
  )
  const darks = useMemo(
    () => darkRows.filter((r) => r.camera_id === (cameraId as UUID)),
    [darkRows, cameraId],
  )

  const toggleBias = (key: string) =>
    onChange({
      ...selection,
      bias: selection.bias.includes(key)
        ? selection.bias.filter((k) => k !== key)
        : [...selection.bias, key],
    })
  const toggleDark = (key: string) =>
    onChange({
      ...selection,
      darks: selection.darks.includes(key)
        ? selection.darks.filter((k) => k !== key)
        : [...selection.darks, key],
    })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Match calibration frames from your library to this session
        {includeDarks ? " (darks and bias for your cooled camera)" : " (bias frames)"}. Only frames
        shot with{" "}
        <span className="font-medium text-foreground">{cameraName(cameraId as UUID)}</span> are
        shown.
      </p>

      <LibraryTable
        title="Bias Frames"
        icon={Layers}
        loading={loading}
        empty="No matching bias frames in your library."
        columns={["Night", "Gain", "Offset", "Binning", "Frames"]}
        rows={bias.map((r) => ({
          key: biasKey(r),
          checked: selection.bias.includes(biasKey(r)),
          onToggle: () => toggleBias(biasKey(r)),
          cells: [
            r.night,
            String(r.gain),
            r.offset == null ? "—" : String(r.offset),
            `${r.binning}x${r.binning}`,
            String(r.total_frames),
          ],
        }))}
      />

      {includeDarks && (
        <LibraryTable
          title="Dark Frames"
          icon={Moon}
          loading={loading}
          empty="No matching dark frames in your library."
          columns={["Night", "Exposure", "Temp", "Gain", "Offset", "Binning", "Frames"]}
          rows={darks.map((r) => ({
            key: darkKey(r),
            checked: selection.darks.includes(darkKey(r)),
            onToggle: () => toggleDark(darkKey(r)),
            cells: [
              r.night,
              `${r.exposure_ms / 1000}s`,
              r.sensor_temp == null ? "—" : `${r.sensor_temp}°C`,
              String(r.gain),
              r.offset == null ? "—" : String(r.offset),
              `${r.binning}x${r.binning}`,
              String(r.total_frames),
            ],
          }))}
        />
      )}
    </div>
  )
}

interface LibraryRow {
  key: string
  checked: boolean
  onToggle: () => void
  cells: string[]
}

function LibraryTable({
  title,
  icon: Icon,
  loading,
  empty,
  columns,
  rows,
}: {
  title: string
  icon: typeof Layers
  loading: boolean
  empty: string
  columns: string[]
  rows: LibraryRow[]
}) {
  const selectedCount = rows.filter((r) => r.checked).length
  return (
    <div className="rounded-md border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon className="size-4 text-primary" />
          {title}
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {selectedCount} of {rows.length} selected
        </span>
      </div>
      <ScrollArea className="max-h-56">
        {loading ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">Loading library…</p>
        ) : rows.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">{empty}</p>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
              <TableRow>
                <TableHead className="h-8 w-8" aria-label="Select" />
                {columns.map((c) => (
                  <TableHead key={c} className="h-8 text-xs">
                    {c}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.key}
                  onClick={row.onToggle}
                  data-selected={row.checked}
                  className={cn("cursor-pointer", row.checked && "bg-primary/10")}
                >
                  <TableCell className="w-8 py-1.5">
                    <Checkbox
                      checked={row.checked}
                      onCheckedChange={row.onToggle}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${row.key}`}
                    />
                  </TableCell>
                  {row.cells.map((cell, i) => (
                    <TableCell key={i} className="py-1.5 text-xs tabular-nums">
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ScrollArea>
    </div>
  )
}
