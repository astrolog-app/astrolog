"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogDialog } from "@/components/log/log-dialog"
import { SessionPreview } from "@/components/log/session-preview"
import {
  columnsFor,
  INITIAL_LOG,
  formatCell,
  type ColumnDef,
  type LogEntry,
  type LogKind,
} from "@/lib/log"
import {
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Telescope,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Sun,
  Cloud,
  Gauge,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { useAppState } from "@/context/state-provider"
import type { BiasFrameRow } from "@/types/imaging-frames"

type ViewMode = "simple" | "detailed"

// map a grouped bias row from the backend onto the calibration log shape so it
// renders in the existing table; fields without a bias equivalent are blanked
function biasRowToEntry(row: BiasFrameRow, cameraName: string): LogEntry {
  return {
    id: `bias:${row.camera_id}:${row.gain}:${row.binning}:${row.offset ?? "x"}:${row.night}`,
    kind: "calibration",
    target: `Bias · ${cameraName}`,
    date: row.night,
    frameType: "Bias",
    frameCount: row.total_frames,
    exposure: 0,
    totalIntegration: 0,
    filter: "—",
    telescope: "—",
    camera: cameraName,
    mount: "—",
    flattener: "—",
    gain: row.gain,
    offset: row.offset ?? 0,
    binning: `${row.binning}x${row.binning}`,
    sensorTemp: 0,
    ambientTemp: 0,
    fwhm: 0,
    hfr: 0,
    sqm: 0,
    bortle: 0,
    moonIllum: 0,
    seeing: "—",
    transparency: "—",
    location: "—",
    guideRms: 0,
    filePath: `CALIBRATION/bias/${row.night}`,
    processed: false,
    notes: `captured ${row.first_captured} – ${row.last_captured}`,
    images: [],
  }
}

export function LogView() {
  const [entries, setEntries] = useState<LogEntry[]>(INITIAL_LOG)
  const [kind, setKind] = useState<LogKind>("session")
  const [mode, setMode] = useState<ViewMode>("simple")
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dialogKind, setDialogKind] = useState<LogKind | null>(null)
  // detailed-view hidden columns, tracked per kind
  const [hidden, setHidden] = useState<Record<LogKind, Set<string>>>({
    session: new Set(),
    calibration: new Set(),
  })

  // real bias-frame groups from the backend (mock returns a couple in web/v0)
  const { appState } = useAppState()
  const [biasRows, setBiasRows] = useState<BiasFrameRow[]>([])

  useEffect(() => {
    let cancelled = false
    api
      .getBiasFrames({ search: null, sort_by: "night", sort_dir: "desc", limit: 1000, offset: 0 })
      .then((page) => {
        if (!cancelled) setBiasRows(page.rows)
      })
      .catch((err) => console.error("failed to load bias frames", err))
    return () => {
      cancelled = true
    }
  }, [])

  // resolve camera names lazily so they fill in once the equipment list loads
  const biasEntries = useMemo<LogEntry[]>(() => {
    const cameras = appState?.equipment.cameras ?? {}
    return biasRows.map((row) =>
      biasRowToEntry(row, cameras[row.camera_id]?.name ?? "Unknown camera"),
    )
  }, [biasRows, appState])

  const allColumns = useMemo(() => columnsFor(kind), [kind])

  const activeColumns: ColumnDef[] = useMemo(() => {
    if (mode === "simple") return allColumns.filter((c) => c.simple)
    return allColumns.filter((c) => !hidden[kind]?.has(c.key as string))
  }, [allColumns, mode, hidden, kind])

  // calibration rows come from the backend, sessions stay on the mock log
  const byKind = useMemo(
    () => (kind === "calibration" ? biasEntries : entries.filter((e) => e.kind === kind)),
    [kind, entries, biasEntries],
  )

  const { filtered, regexError } = useMemo(() => {
    if (!query.trim()) return { filtered: byKind, regexError: false }
    try {
      const re = new RegExp(query, "i")
      const f = byKind.filter((e) =>
        allColumns.some((c) => re.test(String(e[c.key]))),
      )
      return { filtered: f, regexError: false }
    } catch {
      return { filtered: byKind, regexError: true }
    }
  }, [byKind, query, allColumns])

  // keep a valid selection within the current kind
  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null)
    } else if (!filtered.some((e) => e.id === selectedId)) {
      setSelectedId(filtered[0].id)
    }
  }, [filtered, selectedId])

  const selected = byKind.find((e) => e.id === selectedId) ?? null

  function toggleColumn(key: string) {
    setHidden((prev) => {
      const next = new Set(prev[kind])
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return { ...prev, [kind]: next }
    })
  }

  function addEntry(entry: LogEntry) {
    setEntries((prev) => [entry, ...prev])
    setKind(entry.kind)
    setSelectedId(entry.id)
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Astrophotography Log</h1>
          <p className="text-sm text-muted-foreground">
            Add imaging sessions and calibration frames, then review your log.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setDialogKind("calibration")}>
            <Plus data-icon="inline-start" />
            Add Calibration
          </Button>
          <Button onClick={() => setDialogKind("session")}>
            <Plus data-icon="inline-start" />
            Add Session
          </Button>
        </div>
      </div>

      {/* controls: search + kind switch + view mode + columns */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Regex search… e.g. ^M(31|42)|Ha"
            className={cn("pl-8 font-mono text-sm", regexError && "border-destructive focus-visible:ring-destructive/40")}
            spellCheck={false}
          />
        </div>

        <ToggleGroup
          type="single"
          value={kind}
          onValueChange={(v: string) => v && setKind(v as LogKind)}
          variant="outline"
        >
          <ToggleGroupItem value="session">
            <Telescope data-icon="inline-start" />
            Imaging Sessions
          </ToggleGroupItem>
          <ToggleGroupItem value="calibration">
            <Wrench data-icon="inline-start" />
            Calibration Frames
          </ToggleGroupItem>
        </ToggleGroup>

        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(v: string) => v && setMode(v as ViewMode)}
          variant="outline"
        >
          <ToggleGroupItem value="simple">
            <Sparkles data-icon="inline-start" />
            Simple
          </ToggleGroupItem>
          <ToggleGroupItem value="detailed">
            <SlidersHorizontal data-icon="inline-start" />
            Detailed
          </ToggleGroupItem>
        </ToggleGroup>

        {mode === "detailed" && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline">
                  <SlidersHorizontal data-icon="inline-start" />
                  Columns
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="max-h-80 w-52 overflow-y-auto">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allColumns.map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c.key as string}
                    checked={!hidden[kind].has(c.key as string)}
                    onCheckedChange={() => toggleColumn(c.key as string)}
                    closeOnClick={false}
                  >
                    {c.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* main: resizable split between table and permanent preview */}
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-0 flex-1 rounded-lg border border-border"
      >
        <ResizablePanel defaultSize={68} minSize={35}>
          <div className="h-full overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                <TableRow>
                  {activeColumns.map((c) => (
                    <TableHead key={c.key as string} className={cn(c.align === "right" && "text-right")}>
                      {c.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="cursor-pointer"
                    data-state={selectedId === entry.id ? "selected" : undefined}
                    onClick={() => setSelectedId(entry.id)}
                  >
                    {activeColumns.map((c) => (
                      <TableCell
                        key={c.key as string}
                        className={cn(
                          c.align === "right" && "text-right tabular-nums",
                          c.key === "target" && "font-medium text-foreground",
                          c.key === "notes" && "max-w-56 truncate",
                          c.key === "filePath" && "font-mono text-xs text-muted-foreground",
                        )}
                      >
                        {c.key === "target" ? (
                          <span className="flex items-center gap-2">
                            {entry.kind === "session" ? (
                              <Telescope className="size-3.5 text-muted-foreground" />
                            ) : (
                              <Wrench className="size-3.5 text-muted-foreground" />
                            )}
                            {entry.target}
                          </span>
                        ) : c.key === "frameType" ? (
                          <Badge variant="secondary">{entry.frameType}</Badge>
                        ) : c.key === "processed" ? (
                          entry.processed ? (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <CheckCircle2 className="size-3.5" /> Done
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <AlertCircle className="size-3.5" /> Pending
                            </span>
                          )
                        ) : (
                          formatCell(entry, c)
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={activeColumns.length} className="h-32 text-center text-muted-foreground">
                      {regexError ? "Invalid regular expression." : "No entries match your search."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={32} minSize={20}>
          <SessionPreview entry={selected} />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* details strip */}
      <SessionDetails entry={selected} />

      <LogDialog
        open={dialogKind !== null}
        onOpenChange={(o) => !o && setDialogKind(null)}
        kind={dialogKind ?? "session"}
        onSave={addEntry}
      />
    </div>
  )
}

function SessionDetails({ entry }: { entry: LogEntry | null }) {
  if (!entry) return null
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold text-foreground">
        {entry.kind === "session" ? "Session Details" : "Calibration Details"}
      </h2>
      <div className="flex flex-wrap items-start gap-x-8 gap-y-2 text-sm">
        <span className="flex items-center gap-1.5">
          <Sun className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">Gain:</span>
          <span className="font-medium text-foreground tabular-nums">{entry.gain}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Gauge className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">Offset:</span>
          <span className="font-medium text-foreground tabular-nums">{entry.offset}</span>
        </span>
        {entry.kind === "session" && (
          <span className="flex items-center gap-1.5">
            <Cloud className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Conditions:</span>
            <span className="font-medium text-foreground">
              Seeing {entry.fwhm}&quot;, Bortle {entry.bortle}, Moon {entry.moonIllum}%
            </span>
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Notes:</span>
          <span className="text-foreground">{entry.notes || "—"}</span>
        </span>
      </div>
    </div>
  )
}
