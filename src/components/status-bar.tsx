"use client"

import { Progress } from "@/components/ui/progress"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

type Task = {
  id: string
  label: string
  progress: number
}

// Dummy in-memory tasks. Replace with real backend task state later.
const tasks: Task[] = [
  { id: "calibrating", label: "Calibrating frames...", progress: 64 },
  { id: "stacking", label: "Stacking lights...", progress: 28 },
  { id: "indexing", label: "Indexing library...", progress: 91 },
]

export function StatusBar() {
  const [active, ...rest] = tasks
  const extraCount = rest.length

  return (
    <footer className="flex h-7 w-full shrink-0 items-center justify-between gap-4 border-t border-border bg-card px-3 text-xs text-muted-foreground">
      <span className="font-medium">AstroLog v0.1.0</span>

      {active && (
        <HoverCard openDelay={80} closeDelay={120}>
          <HoverCardTrigger asChild>
            <div className="flex cursor-default items-center gap-2 rounded px-1 transition-colors hover:bg-accent hover:text-accent-foreground">
              <span>{active.label}</span>
              {extraCount > 0 && (
                <span className="font-medium text-foreground">{`(+${extraCount})`}</span>
              )}
              <Progress value={active.progress} className="h-1.5 w-32" />
              <span className="tabular-nums">{active.progress}%</span>
            </div>
          </HoverCardTrigger>

          {extraCount > 0 && (
            <HoverCardContent align="end" sideOffset={8} className="w-72 p-0">
              <div className="border-b border-border px-3 py-2 text-xs font-medium text-foreground">
                Running tasks ({tasks.length})
              </div>
              <ul className="flex flex-col">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex flex-col gap-1.5 px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-foreground">
                        {task.label}
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {task.progress}%
                      </span>
                    </div>
                    <Progress value={task.progress} className="h-1.5" />
                  </li>
                ))}
              </ul>
            </HoverCardContent>
          )}
        </HoverCard>
      )}
    </footer>
  )
}
