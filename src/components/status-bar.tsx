import { Progress } from "@/components/ui/progress"

export function StatusBar() {
  return (
    <footer className="flex h-7 w-full shrink-0 items-center justify-between gap-4 border-t border-border bg-card px-3 text-xs text-muted-foreground">
      <span className="font-medium">AstroLog v0.1.0</span>
      <div className="flex items-center gap-2">
        <span>Calibrating frames...</span>
        <Progress value={64} className="h-1.5 w-32" />
        <span className="tabular-nums">64%</span>
      </div>
    </footer>
  )
}
