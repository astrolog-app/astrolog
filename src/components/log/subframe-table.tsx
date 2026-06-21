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
import { useMemo, useState } from "react"

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

  return (
    <div className="bg-muted/40 px-4 py-3">
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

      <div className="overflow-hidden rounded-md border border-border bg-background">
        <Table>
          <TableHeader className="bg-muted/60">
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
