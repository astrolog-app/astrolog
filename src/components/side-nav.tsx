"use client"

import { NotebookPen, Telescope, ChartLine } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type ViewId = "log" | "equipment" | "analytics"

const NAV_ITEMS: { id: ViewId; label: string; icon: typeof NotebookPen }[] = [
  { id: "log", label: "Log", icon: NotebookPen },
  { id: "equipment", label: "Equipment", icon: Telescope },
  //{ id: "analytics", label: "Analytics", icon: ChartLine },
]

interface SideNavProps {
  active: ViewId
  onChange: (view: ViewId) => void
}

export function SideNav({ active, onChange }: SideNavProps) {
  return (
    <nav className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-border bg-card py-2">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <Tooltip key={id}>
          <TooltipTrigger
            onClick={() => onChange(id)}
            className={cn(
              "flex size-9 items-center justify-center rounded-md transition-colors",
              active === id
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            <span className="sr-only">{label}</span>
          </TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      ))}
    </nav>
  )
}
