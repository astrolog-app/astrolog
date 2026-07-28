"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  SUBFRAME_COLUMNS,
  formatSubCell,
  makeSubFrames,
  type LogEntry,
} from "@/lib/log"
import { cn } from "@/lib/utils"
import { CheckCircle2, Search, SlidersHorizontal, Telescope, Moon, Sun, XCircle } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

// frame types a session's subframe table can switch between (UI only for now)
const SUBFRAME_SETS = [
  { value: "Light", label: "Light Frames", icon: Telescope },
  { value: "Dark", label: "Dark Frames", icon: Moon },
  { value: "Flat", label: "Flat Frames", icon: Sun },
] as const

/**
 * Renders the individual subframes that make up one grouped log entry as a
 * nested table. Data is generated on the frontend for now (no real logic yet).
 */
export function SubFrameTable({ entry }: { entry: LogEntry }) {
  const frames = useMemo(() => makeSubFrames(entry), [entry])
  const accepted = frames.filter((f) => f.accepted).length

  // dummy per-group availability — not every session has all frame types yet
  // (UI only; switching does not change the rendered data for now)
  const available = useMemo(() => {
    const h = entry.id.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0)
    return { Light: true, Dark: h % 2 === 0, Flat: h % 3 !== 0 }
  }, [entry.id])
  const [frameSet, setFrameSet] = useState<"Light" | "Dark" | "Flat">("Light")

  // fix the inner table height to fill down to the bottom of the outer scroll
  // viewport: it never grows past the visible area (scrolls internally), and
  // when there are few subframes it adds empty space instead of shrinking
  const scrollRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number>()
  // the outer table is `w-max` (as wide as its widest row); the expanded cell
  // would inherit that width. Instead pin the expanded content to the visible
  // viewport width so it is "as wide as possible, but not wider".
  const [width, setWidth] = useState<number>()

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const viewport = el.closest<HTMLElement>("[data-slot=scroll-area-viewport]")
    if (!viewport) return
    // sticky header height the parent anchors the expanded row to (see log-view)
    const HEADER_OFFSET = 40
    const measure = () => {
      // compute scroll-INDEPENDENTLY: when expanded, the parent scrolls the
      // session row to sit HEADER_OFFSET below the viewport top. The gap between
      // that row and this table wrapper is constant, so the available height is
      // viewport visible height minus the anchor offset, that gap, and padding.
      const sessionRow = el.closest("tr")?.previousElementSibling
      const gap = sessionRow
        ? el.getBoundingClientRect().top - sessionRow.getBoundingClientRect().top
        : el.getBoundingClientRect().top - viewport.getBoundingClientRect().top
      setHeight(Math.max(96, viewport.clientHeight - HEADER_OFFSET - gap - 8))
      setWidth(viewport.clientWidth)
    }
    measure()
    // measure once the parent's smooth scroll-to-row has settled, then keep
    // the height fixed — do NOT recompute on scroll, otherwise the table would
    // grow to track the viewport bottom and appear to "stick" to it
    const raf = requestAnimationFrame(measure)
    const settle = setTimeout(measure, 350)
    window.addEventListener("resize", measure)
    // a resizable panel changes the viewport size WITHOUT firing window resize,
    // so observe the viewport directly. ResizeObserver only fires on actual size
    // changes (not on scroll), so it won't reintroduce the stick-on-scroll bug.
    const ro = new ResizeObserver(measure)
    ro.observe(viewport)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(settle)
      window.removeEventListener("resize", measure)
      ro.disconnect()
    }
  }, [])

  return (
    <div ref={rootRef} className="sticky left-0 bg-muted/40 px-4 py-3" style={{ width }}>
      {/* toolbar: search + (sessions only) frame-type filter + columns — UI only, no logic yet */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="relative min-w-44 max-w-64 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search subframes…"
            className="h-8 pl-8 text-xs"
            spellCheck={false}
          />
        </div>

        {entry.kind === "session" && (
          <ToggleGroup
            type="single"
            size="sm"
            variant="outline"
            value={frameSet}
            onValueChange={(v: string) => v && setFrameSet(v as "Light" | "Dark" | "Flat")}
          >
            {SUBFRAME_SETS.map(({ value, label, icon: Icon }) => (
              <ToggleGroupItem
                key={value}
                value={value}
                className="h-8"
                disabled={!available[value]}
              >
                <Icon data-icon="inline-start" />
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="h-8">
                <SlidersHorizontal data-icon="inline-start" />
                Columns
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="max-h-80 w-48 overflow-y-auto">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SUBFRAME_COLUMNS.map((c) => (
                <DropdownMenuCheckboxItem key={c.key} checked closeOnClick={false}>
                  {c.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{frames.length} subframes</span>
        <span aria-hidden>·</span>
        <span>{accepted} accepted</span>
        {accepted !== frames.length && (
          <>
            <span aria-hidden>·</span>
            <span>{frames.length - accepted} rejected</span>
          </>
        )}
      </div>

      <div
        ref={scrollRef}
        className="overflow-auto rounded-md border border-border bg-background"
        style={{ height }}
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            <TableRow>
              {SUBFRAME_COLUMNS.map((c) => (
                <TableHead
                  key={c.key}
                  className={cn("h-8 text-xs", c.align === "right" && "text-right")}
                >
                  {c.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {frames.map((frame) => (
              <TableRow key={frame.id}>
                {SUBFRAME_COLUMNS.map((c) => (
                  <TableCell
                    key={c.key}
                    className={cn(
                      "py-1.5 text-xs",
                      c.align === "right" && "text-right tabular-nums",
                      c.key === "fileName" && "font-mono text-muted-foreground",
                    )}
                  >
                    {c.key === "accepted" ? (
                      frame.accepted ? (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle2 className="size-3" /> Accepted
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="size-3" /> Rejected
                        </Badge>
                      )
                    ) : (
                      formatSubCell(frame, c)
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
