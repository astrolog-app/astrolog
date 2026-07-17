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
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  IMPORT_COLUMNS,
  formatImportCell,
  type ImportFrame,
} from "@/lib/import-frames"
import type { LogImage } from "@/lib/log"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle2, ImageIcon, XCircle } from "lucide-react"

// faux star field preview reused visual language from session-preview, kept
// local so the review panel is self contained
function StarField({
  image,
  className,
  children,
}: {
  image: LogImage
  className?: string
  children?: React.ReactNode
}) {
  const bg = `hsl(${image.hue} 45% 12%)`
  const glow = `hsl(${image.hue} 70% 66%)`
  return (
    <div className={cn("relative overflow-hidden", className)} style={{ background: bg }}>
      <span
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: `radial-gradient(1px 1px at 18% 28%, ${glow} 50%, transparent 51%), radial-gradient(1.5px 1.5px at 68% 58%, ${glow} 50%, transparent 51%), radial-gradient(1px 1px at 42% 78%, ${glow} 50%, transparent 51%), radial-gradient(2px 2px at 83% 22%, ${glow} 50%, transparent 51%), radial-gradient(1px 1px at 55% 40%, ${glow} 50%, transparent 51%), radial-gradient(1.5px 1.5px at 30% 62%, ${glow} 50%, transparent 51%), radial-gradient(1px 1px at 75% 80%, ${glow} 50%, transparent 51%), radial-gradient(2.5px 2.5px at 48% 50%, ${glow} 45%, transparent 46%)`,
        }}
      />
      {children}
    </div>
  )
}

interface Issue {
  fileName: string
  message: string
}

export function ImportReview({ frames }: { frames: ImportFrame[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(frames[0]?.id ?? null)

  // keep a valid selection when the frame set changes
  useEffect(() => {
    setSelectedId((prev) =>
      prev && frames.some((f) => f.id === prev) ? prev : frames[0]?.id ?? null,
    )
  }, [frames])

  const { errors, warnings, okCount } = useMemo(() => {
    const errors: Issue[] = []
    const warnings: Issue[] = []
    let okCount = 0
    for (const f of frames) {
      if (f.status === "ok") okCount++
      for (const m of f.messages) {
        if (f.status === "error") errors.push({ fileName: f.fileName, message: m })
        else if (f.status === "warning") warnings.push({ fileName: f.fileName, message: m })
      }
    }
    return { errors, warnings, okCount }
  }, [frames])

  const selected = frames.find((f) => f.id === selectedId) ?? null

  return (
    <div className="flex h-full flex-col gap-3">
      {/* summary alert boxes */}
      {errors.length > 0 && (
        <AlertBox
          tone="error"
          icon={XCircle}
          title={`${errors.length} error${errors.length === 1 ? "" : "s"}`}
          issues={errors}
        />
      )}
      {warnings.length > 0 && (
        <AlertBox
          tone="warning"
          icon={AlertTriangle}
          title={`${warnings.length} warning${warnings.length === 1 ? "" : "s"}`}
          issues={warnings}
        />
      )}
      {errors.length === 0 && warnings.length === 0 && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          <CheckCircle2 className="size-4 text-primary" />
          All {frames.length} frames look good.
        </div>
      )}

      {/* table + preview */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 overflow-hidden rounded-md border border-border bg-background">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
                <TableRow>
                  {IMPORT_COLUMNS.map((c) => (
                    <TableHead
                      key={c.key}
                      className={cn("h-8 text-xs", c.align === "right" && "text-right")}
                    >
                      {c.label}
                    </TableHead>
                  ))}
                  <TableHead className="h-8 text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {frames.map((frame) => (
                  <TableRow
                    key={frame.id}
                    onClick={() => setSelectedId(frame.id)}
                    data-selected={frame.id === selectedId}
                    className={cn(
                      "cursor-pointer",
                      frame.status === "error" &&
                        "bg-destructive/10 hover:bg-destructive/15 data-[selected=true]:bg-destructive/20",
                      frame.status === "warning" &&
                        "bg-warning/10 hover:bg-warning/15 data-[selected=true]:bg-warning/20",
                      frame.status === "ok" && "data-[selected=true]:bg-muted",
                    )}
                  >
                    {IMPORT_COLUMNS.map((c) => (
                      <TableCell
                        key={c.key}
                        className={cn(
                          "py-1.5 text-xs",
                          c.align === "right" && "text-right tabular-nums",
                          c.key === "fileName" && "font-mono text-muted-foreground",
                        )}
                      >
                        {formatImportCell(frame, c)}
                      </TableCell>
                    ))}
                    <TableCell className="py-1.5 text-xs">
                      <StatusBadge status={frame.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* image preview for the selected frame */}
        <div className="flex flex-col gap-2 overflow-y-auto rounded-md border border-border bg-background p-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="size-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Preview</span>
          </div>
          {selected ? (
            <>
              <StarField
                image={selected.image}
                className="aspect-square w-full rounded-lg border border-border"
              >
                <span className="absolute left-2 top-2">
                  <StatusBadge status={selected.status} />
                </span>
              </StarField>
              <p
                className="truncate text-center font-mono text-xs text-muted-foreground"
                title={selected.fileName}
              >
                {selected.fileName}
              </p>
              {selected.messages.length > 0 && (
                <ul className="flex flex-col gap-1 text-xs">
                  {selected.messages.map((m, i) => (
                    <li
                      key={i}
                      className={cn(
                        "rounded px-2 py-1",
                        selected.status === "error"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-warning/10 text-warning-foreground",
                      )}
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              No frame selected.
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground tabular-nums">{okCount}</span> of{" "}
        <span className="tabular-nums">{frames.length}</span> frames ready to import
        {errors.length > 0 && ` · ${errors.length} will be skipped`}
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: ImportFrame["status"] }) {
  if (status === "error") {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="size-3" /> Error
      </Badge>
    )
  }
  if (status === "warning") {
    return (
      <Badge className="gap-1 border-transparent bg-warning text-warning-foreground">
        <AlertTriangle className="size-3" /> Warning
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <CheckCircle2 className="size-3" /> OK
    </Badge>
  )
}

function AlertBox({
  tone,
  icon: Icon,
  title,
  issues,
}: {
  tone: "error" | "warning"
  icon: typeof XCircle
  title: string
  issues: Issue[]
}) {
  return (
    <div
      className={cn(
        "rounded-md border px-3 py-2",
        tone === "error"
          ? "border-destructive/30 bg-destructive/10"
          : "border-warning/40 bg-warning/10",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 text-sm font-medium",
          tone === "error" ? "text-destructive" : "text-warning-foreground",
        )}
      >
        <Icon className="size-4" />
        {title}
      </div>
      <ScrollArea className="mt-1 max-h-24">
        <ul className="flex flex-col gap-0.5 pr-2 text-xs text-foreground/80">
          {issues.map((issue, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="font-mono text-muted-foreground">{issue.fileName}</span>
              <span aria-hidden>—</span>
              <span>{issue.message}</span>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  )
}
