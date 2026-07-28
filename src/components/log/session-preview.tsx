"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ImageIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { makeImages, type LogEntry, type LogImage } from "@/lib/log"

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
      {/* faux star field via radial gradients — no real image is imported */}
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

/** Permanent, resizable preview panel — large main image with filename,
 *  Previous/Next navigation, an "x of y" counter, and a thumbnail strip.
 *  Does not block the screen. */
export function SessionPreview({ entry }: { entry: LogEntry | null }) {
  const [index, setIndex] = useState(0)

  // the selected entry carries the frames it contains; fall back to deriving
  // them from the entry's subframes so a freshly selected row previews its
  // images even before any are explicitly linked
  const images = useMemo<LogImage[]>(() => {
    if (!entry) return []
    return entry.images.length ? entry.images : makeImages(entry)
  }, [entry])

  // reset to first frame whenever the selected entry changes
  useEffect(() => {
    setIndex(0)
  }, [entry])

  if (!entry) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <ImageIcon className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">No entry selected</p>
        <p className="text-sm text-muted-foreground">Select a row to preview its frames here.</p>
      </div>
    )
  }

  const total = images.length
  const safeIndex = Math.min(index, Math.max(total - 1, 0))
  const active = images[safeIndex] ?? null

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="flex items-center gap-2">
        <ImageIcon className="size-4 text-primary" />
        <span className="font-semibold text-foreground">Image Preview</span>
        <Badge variant="secondary" className="ml-auto">
          {entry.target}
        </Badge>
      </div>

      {active ? (
        <>
          <StarField image={active} className="aspect-video w-full rounded-lg border border-border">
            <span className="absolute left-2 top-2">
              <Badge variant="secondary" className="text-[10px]">
                {active.frameType}
              </Badge>
            </span>
          </StarField>

          <p className="truncate text-center text-sm text-muted-foreground" title={active.label}>
            {active.label}
          </p>

          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safeIndex <= 0}
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
            >
              <ChevronLeft data-icon="inline-start" />
              Previous
            </Button>
            <span className="text-sm tabular-nums text-muted-foreground">
              {safeIndex + 1} of {total}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={safeIndex >= total - 1}
              onClick={() => setIndex((i) => Math.min(i + 1, total - 1))}
            >
              Next
              <ChevronRight data-icon="inline-end" />
            </Button>
          </div>

          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Preview ${img.label}`}
                  className={cn(
                    "shrink-0 rounded-md border-2 transition-colors",
                    i === safeIndex ? "border-primary" : "border-transparent hover:border-border",
                  )}
                >
                  <StarField image={img} className="aspect-square w-20 rounded-[3px]" />
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
          <ImageIcon className="size-4" />
          No frames linked to this entry.
        </div>
      )}
    </div>
  )
}
