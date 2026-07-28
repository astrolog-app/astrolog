"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SessionPreview } from "@/components/log/session-preview"
import { SubFrameTable } from "@/components/log/subframe-table"
import {
  columnsFor,
  formatCell,
  makeSubFrames,
  type ColumnDef,
  type FrameType,
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
  Sun,
  Gauge,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { useAppState } from "@/context/state-provider"
import type {
  BiasFrameRow,
  DarkFlatFrameRow,
  DarkFrameRow,
  FlatFrameRow,
  LightFrameRow,
} from "@/types/imaging-frames"
import type { UUID } from "crypto"

type ViewMode = "simple" | "detailed"

// shared fields a calibration row contributes to the log shape; everything a
// given frame type lacks is blanked by calibEntry below
interface CalibInput {
  // path segment + a unique-per-group suffix together form the row id
  pathSeg: string
  idKey: string
  frameType: FrameType
  name: string
  night: string
  frameCount: number
  exposure?: number
  filter?: string
  telescope?: string
  camera: string
  gain: number
  offset: number | null
  binning: number
  sensorTemp?: number | null
}

// map any grouped calibration row onto the calibration log shape so it renders
// in the existing table; fields without an equivalent are blanked
function calibEntry(i: CalibInput): LogEntry {
  return {
    id: `${i.pathSeg}:${i.idKey}`,
    kind: "calibration",
    target: i.name,
    date: i.night,
    frameType: i.frameType,
    frameCount: i.frameCount,
    exposure: i.exposure ?? 0,
    totalIntegration: 0,
    filter: i.filter ?? "—",
    telescope: i.telescope ?? "—",
    camera: i.camera,
    gain: i.gain,
    offset: i.offset ?? 0,
    binning: `${i.binning}x${i.binning}`,
    sensorTemp: i.sensorTemp ?? 0,
    images: [],
  }
}

// map a grouped light row onto the imaging-session log shape
function lightRowToEntry(
  row: LightFrameRow,
  cameraName: string,
  telescopeName: string,
  filterName: string,
): LogEntry {
  const expSec = row.exposure / 1000
  return {
    id: `light:${row.camera_id}:${row.telescope_id ?? "x"}:${row.filter_id ?? "x"}:${row.target}:${row.gain}:${row.binning}:${row.offset ?? "x"}:${row.exposure}:${row.sensor_temp ?? "x"}:${row.night}`,
    kind: "session",
    target: row.target,
    date: row.night,
    frameType: "Light",
    frameCount: row.total_frames,
    exposure: expSec,
    totalIntegration: Math.round((row.total_frames * expSec) / 60),
    filter: filterName,
    telescope: telescopeName,
    camera: cameraName,
    gain: row.gain,
    offset: row.offset ?? 0,
    binning: `${row.binning}x${row.binning}`,
    sensorTemp: row.sensor_temp ?? 0,
    images: [],
  }
}

export function LogView() {
  // backend frames drive the table; entries holds only dialog-added rows
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [kind, setKind] = useState<LogKind>("session")
  const [mode, setMode] = useState<ViewMode>("simple")
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // subframe row selected within the expanded entry; drives the image preview
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [dialogKind, setDialogKind] = useState<LogKind | null>(null)
  // detailed-view hidden columns, tracked per kind
  const [hidden, setHidden] = useState<Record<LogKind, Set<string>>>({
    session: new Set(),
    calibration: new Set(),
  })

  // grouped frame rows from the backend (the mock returns samples in web/v0)
  const { appState } = useAppState()
  const [biasRows, setBiasRows] = useState<BiasFrameRow[]>([])
  const [darkRows, setDarkRows] = useState<DarkFrameRow[]>([])
  const [darkFlatRows, setDarkFlatRows] = useState<DarkFlatFrameRow[]>([])
  const [flatRows, setFlatRows] = useState<FlatFrameRow[]>([])
  const [lightRows, setLightRows] = useState<LightFrameRow[]>([])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api.getBiasFrames({ search: null, sort_by: "night", sort_dir: "desc", limit: 1000, offset: 0 }),
      api.getDarkFrames({ search: null, sort_by: "night", sort_dir: "desc", limit: 1000, offset: 0 }),
      api.getDarkFlatFrames({ search: null, sort_by: "night", sort_dir: "desc", limit: 1000, offset: 0 }),
      api.getFlatFrames({ search: null, sort_by: "night", sort_dir: "desc", limit: 1000, offset: 0 }),
      api.getLightFrames({ search: null, sort_by: "night", sort_dir: "desc", limit: 1000, offset: 0 }),
    ])
      .then(([bias, dark, darkFlat, flat, light]) => {
        if (cancelled) return
        setBiasRows(bias.rows)
        setDarkRows(dark.rows)
        setDarkFlatRows(darkFlat.rows)
        setFlatRows(flat.rows)
        setLightRows(light.rows)
      })
      .catch((err) => console.error("failed to load frames", err))
    return () => {
      cancelled = true
    }
  }, [])

  // resolve gear names lazily so they fill in once the equipment list loads
  const calibrationEntries = useMemo<LogEntry[]>(() => {
    const cameras = appState?.equipment.cameras ?? {}
    const telescopes = appState?.equipment.telescopes ?? {}
    const filters = appState?.equipment.filters ?? {}
    const camName = (id: UUID) => cameras[id]?.name ?? "Unknown camera"
    const optName = (map: Record<UUID, { name: string }>, id: UUID | null) =>
      id ? map[id]?.name ?? "Unknown" : "—"

    const bias = biasRows.map((r) =>
      calibEntry({
        pathSeg: "bias",
        idKey: `${r.camera_id}:${r.gain}:${r.binning}:${r.offset ?? "x"}:${r.night}`,
        frameType: "Bias",
        name: `Bias · ${camName(r.camera_id)}`,
        night: r.night,
        frameCount: r.total_frames,
        camera: camName(r.camera_id),
        gain: r.gain,
        offset: r.offset,
        binning: r.binning,
      }),
    )

    const dark = darkRows.map((r) =>
      calibEntry({
        pathSeg: "darks",
        idKey: `${r.camera_id}:${r.gain}:${r.binning}:${r.offset ?? "x"}:${r.exposure_ms}:${r.sensor_temp ?? "x"}:${r.night}`,
        frameType: "Dark",
        name: `Dark · ${r.exposure_ms / 1000}s · ${camName(r.camera_id)}`,
        night: r.night,
        frameCount: r.total_frames,
        exposure: r.exposure_ms / 1000,
        camera: camName(r.camera_id),
        gain: r.gain,
        offset: r.offset,
        binning: r.binning,
        sensorTemp: r.sensor_temp,
      }),
    )

    const darkFlat = darkFlatRows.map((r) =>
      calibEntry({
        pathSeg: "darkflats",
        idKey: `${r.camera_id}:${r.gain}:${r.binning}:${r.offset ?? "x"}:${r.exposure_ms}:${r.night}`,
        frameType: "Dark Flat",
        name: `Dark Flat · ${r.exposure_ms / 1000}s · ${camName(r.camera_id)}`,
        night: r.night,
        frameCount: r.total_frames,
        exposure: r.exposure_ms / 1000,
        camera: camName(r.camera_id),
        gain: r.gain,
        offset: r.offset,
        binning: r.binning,
      }),
    )

    const flat = flatRows.map((r) =>
      calibEntry({
        pathSeg: "flats",
        idKey: `${r.camera_id}:${r.telescope_id ?? "x"}:${r.filter_id ?? "x"}:${r.gain}:${r.binning}:${r.offset ?? "x"}:${r.exposure_ms}:${r.night}`,
        frameType: "Flat",
        name: `Flat · ${optName(filters, r.filter_id)} · ${camName(r.camera_id)}`,
        night: r.night,
        frameCount: r.total_frames,
        exposure: r.exposure_ms / 1000,
        filter: optName(filters, r.filter_id),
        telescope: optName(telescopes, r.telescope_id),
        camera: camName(r.camera_id),
        gain: r.gain,
        offset: r.offset,
        binning: r.binning,
      }),
    )

    return [...bias, ...dark, ...flat, ...darkFlat]
  }, [biasRows, darkRows, darkFlatRows, flatRows, appState])

  const sessionEntries = useMemo<LogEntry[]>(() => {
    const cameras = appState?.equipment.cameras ?? {}
    const telescopes = appState?.equipment.telescopes ?? {}
    const filters = appState?.equipment.filters ?? {}
    return lightRows.map((r) =>
      lightRowToEntry(
        r,
        cameras[r.camera_id]?.name ?? "Unknown camera",
        r.telescope_id ? telescopes[r.telescope_id]?.name ?? "Unknown" : "—",
        r.filter_id ? filters[r.filter_id]?.name ?? "Unknown" : "—",
      ),
    )
  }, [lightRows, appState])

  const allColumns = useMemo(() => columnsFor(kind), [kind])

  const activeColumns: ColumnDef[] = useMemo(() => {
    if (mode === "simple") return allColumns.filter((c) => c.simple)
    return allColumns.filter((c) => !hidden[kind]?.has(c.key as string))
  }, [allColumns, mode, hidden, kind])

  // both tabs are backend-driven; dialog-added rows are layered on top by kind
  const byKind = useMemo(
    () =>
      kind === "calibration"
        ? [...calibrationEntries, ...entries.filter((e) => e.kind === "calibration")]
        : [...sessionEntries, ...entries.filter((e) => e.kind === "session")],
    [kind, entries, calibrationEntries, sessionEntries],
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

  // show at most PAGE_SIZE rows at a time; the table body still scrolls
  const PAGE_SIZE = 25
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  )

  // reset to the first page whenever the data set changes
  useEffect(() => {
    setPage(1)
  }, [kind, query])

  // clamp the page if the filtered set shrinks below it
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const selected = byKind.find((e) => e.id === selectedId) ?? null

  // when the selected entry changes, default the preview to its first subframe
  useEffect(() => {
    if (!selected) {
      setSelectedSubId(null)
      return
    }
    const frames = makeSubFrames(selected)
    setSelectedSubId(frames[0]?.id ?? null)
    // key on selectedId only: the entry object is derived fresh each render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  // keep references to each session row so we can scroll one to the top
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>())
  const scrollToIdRef = useRef<string | null>(null)
  // once an expanded row is scrolled into place, lock the outer table scroll
  const [viewLocked, setViewLocked] = useState(false)
  // id of a row that is animating closed (still mounted, collapsing to 0 height)
  const [closingId, setClosingId] = useState<string | null>(null)
  const closeTimer = useRef<number | null>(null)

  function toggleExpand(id: string) {
    const willOpen = !expandedIds.has(id)
    // opening a row also selects it so its subframes drive the image preview
    if (willOpen) setSelectedId(id)
    // only one row may be expanded at a time
    setExpandedIds((prev) => {
      // when opening, remember which row to scroll to the top after render
      scrollToIdRef.current = willOpen ? id : null
      if (closeTimer.current) {
        window.clearTimeout(closeTimer.current)
        closeTimer.current = null
      }
      if (willOpen) {
        // opening a row: cancel any pending close so it doesn't linger
        setClosingId(null)
        return new Set([id])
      }
      // closing: keep the row mounted so it can animate collapsed, then unmount
      setClosingId(id)
      closeTimer.current = window.setTimeout(() => {
        setClosingId(null)
        closeTimer.current = null
      }, 300)
      return new Set()
    })
  }

  // position the expanded row under the sticky header and lock the outer scroll.
  // NOTE: derive everything from `expandedIds` (not just the one-shot
  // scrollToIdRef) so that when this effect re-runs after the view is hidden and
  // shown again (React <Activity> tears down and recreates effects), we RE-apply
  // the lock and re-position the row instead of unlocking it. Also depends on
  // `paged` so paginating away from and back to the expanded row re-positions
  // and re-locks it instead of leaving it stuck at the top.
  useEffect(() => {
    const expandedId = expandedIds.size ? [...expandedIds][0] : null
    // treat as "not expanded here" if nothing is open OR the expanded row lives
    // on another page (paged away): release the lock so that page scrolls freely
    if (!expandedId || !paged.some((e) => e.id === expandedId)) {
      setViewLocked(false)
      return
    }
    // a fresh open animates smoothly; a re-show just snaps back into place
    const smooth = scrollToIdRef.current === expandedId
    scrollToIdRef.current = null

    const row = rowRefs.current.get(expandedId)
    const viewport = row?.closest<HTMLElement>("[data-slot=scroll-area-viewport]")
    if (!row || !viewport) return
    const headerHeight = 40 // sticky TableHeader (h-10)

    let raf1 = 0
    let raf2 = 0
    let lockTimer = 0
    // Wait for the expanded subframe table to commit its height before
    // scrolling: it grows the scrollable content so the last rows have enough
    // room to reach the top. Without this the scroll is clamped and the row
    // stays low, leaving the expanded view not filling the screen.
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const delta = row.getBoundingClientRect().top - viewport.getBoundingClientRect().top - headerHeight
        // reset horizontal scroll to 0 so the viewport-width expanded content
        // pins flush to the visible left edge before scroll is locked
        viewport.scrollTo({ top: viewport.scrollTop + delta, left: 0, behavior: smooth ? "smooth" : "auto" })
        // lock once the smooth scroll settles; on a re-show lock immediately
        lockTimer = window.setTimeout(() => setViewLocked(true), smooth ? 450 : 0)
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      clearTimeout(lockTimer)
    }
  }, [expandedIds, paged])

  function toggleColumn(key: string) {    setHidden((prev) => {
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
        <Button className="flex items-center gap-2" onClick={() => setDialogKind("session")}>
          <Plus data-icon="inline-start" />
          Import Frames
        </Button>
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
          <div className="flex h-full flex-col">
            <ScrollArea
              className={cn(
                "min-h-0 flex-1 [&_[data-slot=scroll-area-viewport]>div]:!block [&_[data-slot=scroll-area-viewport]>div]:!w-max [&_[data-slot=scroll-area-viewport]>div]:!min-w-full [&_[data-slot=table-container]]:overflow-visible",
                viewLocked &&
                "[&_[data-slot=scroll-area-scrollbar]]:hidden [&_[data-slot=scroll-area-viewport]]:!overflow-hidden"
              )}
            >
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-muted">
                  <TableRow>
                    <TableHead className="w-8" aria-label="Expand" />
                    {activeColumns.map((c) => (
                      <TableHead key={c.key as string} className={cn(c.align === "right" && "text-right")}>
                        {c.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                {paged.map((entry) => {
                  const expanded = expandedIds.has(entry.id)
                  return (
                    <TableBody key={entry.id}>
                      <TableRow
                        ref={(el) => {
                          if (el) rowRefs.current.set(entry.id, el)
                          else rowRefs.current.delete(entry.id)
                        }}
                        className="cursor-pointer"
                        data-state={selectedId === entry.id ? "selected" : undefined}
                        aria-expanded={expanded}
                        onClick={() => setSelectedId(entry.id)}
                      >
                        <TableCell className="w-8 pr-0">
                          <button
                            type="button"
                            aria-label={expanded ? "Collapse subframes" : "Expand subframes"}
                            className="flex size-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleExpand(entry.id)
                            }}
                          >
                            <ChevronRight
                              className={cn(
                                "size-4 transition-transform",
                                expanded && "rotate-90",
                              )}
                            />
                          </button>
                        </TableCell>
                        {activeColumns.map((c) => (
                          <TableCell
                            key={c.key as string}
                            className={cn(
                              c.align === "right" && "text-right tabular-nums",
                              c.key === "target" && "font-medium text-foreground",
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
                            ) : (
                              formatCell(entry, c)
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      {(expanded || closingId === entry.id) && (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={activeColumns.length + 1} className="p-0">
                            <div
                              className={cn(
                                "grid transition-[grid-template-rows] duration-300 ease-out",
                                expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                              )}
                            >
                              <div className="overflow-hidden">
                                <SubFrameTable
                                  entry={entry}
                                  selectedSubId={selectedSubId}
                                  onSelectSubFrame={setSelectedSubId}
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  )
                })}
                {filtered.length === 0 && (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={activeColumns.length + 1} className="h-32 text-center text-muted-foreground">
                        {regexError ? "Invalid regular expression." : "No entries match your search."}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            {filtered.length > 0 && (
              <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <span>
                Showing{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground tabular-nums">{filtered.length}</span>
              </span>
                <div className="flex items-center gap-2">
                <span className="tabular-nums">
                  Page {page} of {totalPages}
                </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    aria-label="Previous page"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    aria-label="Next page"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={32} minSize={20}>
          <SessionPreview
            entry={selected}
            selectedSubId={selectedSubId}
            onSelectSub={setSelectedSubId}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* details strip */}
      <SessionDetails entry={selected} />
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
      </div>
    </div>
  )
}
