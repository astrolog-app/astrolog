"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Telescope,
  FolderOpen,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  SlidersHorizontal,
  Stars,
  Ruler,
  Sun,
  Moon,
  Monitor,
  FolderPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { api } from "@/lib/api"
import type { Unit } from "@/types/app-state"
import { cn } from "@/lib/utils"

type Step = {
  id: number
  label: string
  title: string
  description: string
  icon: React.ElementType
}

const STEPS: Step[] = [
  {
    id: 1,
    label: "Welcome",
    title: "Welcome to AstroLog",
    description: "Set up your workspace to start logging your astrophotography sessions.",
    icon: Sparkles,
  },
  {
    id: 2,
    label: "Library",
    title: "Choose your library",
    description:
      "Select an empty folder for a fresh library, or an existing folder that already contains an .astrolog directory.",
    icon: FolderOpen,
  },
  {
    id: 3,
    label: "Appearance",
    title: "Appearance & units",
    description: "Pick your preferred measurement system and color theme.",
    icon: SlidersHorizontal,
  },
  {
    id: 4,
    label: "Plate solving",
    title: "Plate solving database",
    description: "Optional: point AstroLog to your local star database for plate solving.",
    icon: Stars,
  },
]

type ThemeMode = "DARK" | "WHITE" | "SYSTEM"

export function WelcomeScreen() {
  const router = useRouter()
  const [current, setCurrent] = useState(1)
  const [libraryPath, setLibraryPath] = useState("")
  const [unit, setUnit] = useState<Unit>("METRIC")
  const [theme, setTheme] = useState<ThemeMode>("SYSTEM")
  const [starDbPath, setStarDbPath] = useState("")
  const [finishing, setFinishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = STEPS.length
  const progress = (current / total) * 100
  const active = STEPS[current - 1]

  const next = () => setCurrent((c) => Math.min(c + 1, total))
  const back = () => setCurrent((c) => Math.max(c - 1, 1))

  // the backend validates the hard block (empty folder or existing library)
  // during picking, so an invalid choice never lands in libraryPath and the
  // continue button stays disabled
  const browseLibrary = async () => {
    try {
      const picked = await api.pickLibraryFolder()
      if (picked) {
        setLibraryPath(picked)
        setError(null)
      }
    } catch (e) {
      setLibraryPath("")
      setError(String(e))
    }
  }

  const browseStarDb = async () => {
    const picked = await api.pickFolder()
    if (picked) setStarDbPath(picked)
  }

  // on success the tauri backend restarts the app into the main ui and the
  // promise never resolves; the redirect below only runs in the browser mock
  const finish = async () => {
    setFinishing(true)
    setError(null)
    try {
      await api.finishSetup(libraryPath, unit)
      router.replace("/")
    } catch (e) {
      setError(String(e))
      setFinishing(false)
    }
  }

  return (
    <div className="grid h-screen grid-cols-1 overflow-hidden bg-background font-sans md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.1fr)]">
      {/* Left: hero / image placeholder */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden p-10 md:flex"
        aria-hidden="true"
      >
        {/* Hero image */}
        <img
          src="/welcome.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />

        <div className="relative flex items-center gap-2 text-foreground">
          <Telescope className="size-6 text-primary" />
          <span className="text-lg font-semibold tracking-tight">AstroLog</span>
        </div>

        <div className="relative max-w-sm">
          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground">
            Catalog the night sky, one frame at a time.
          </h1>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
            Track imaging sessions, calibration frames, and your equipment in one
            place built for deep-sky photographers.
          </p>
        </div>
      </aside>

      {/* Right: stepped setup with progress bar */}
      <section className="flex min-w-0 flex-col justify-center px-6 py-10 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Progress header */}
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>
                Step {current} of {total}
              </span>
              <span className="tabular-nums">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />

            {/* Step markers */}
            <ol className="mt-5 flex items-center justify-between">
              {STEPS.map((step) => {
                const done = step.id < current
                const isActive = step.id === current
                const StepIcon = step.icon
                return (
                  <li key={step.id} className="flex flex-col items-center gap-2">
                    <span
                      className={cn(
                        "flex size-9 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                        done && "border-primary bg-primary text-primary-foreground",
                        isActive && "border-primary bg-primary/10 text-primary",
                        !done && !isActive && "border-border bg-card text-muted-foreground",
                      )}
                    >
                      {done ? <Check className="size-4" /> : <StepIcon className="size-4" />}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-medium",
                        isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* Step content */}
          <div className="min-h-[220px]">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {active.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {active.description}
            </p>

            <div className="mt-6">
              {current === 1 && (
                <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
                  AstroLog keeps a local catalog of your sessions and frames. This
                  quick setup gets your workspace ready in a few steps.
                </div>
              )}

              {current === 2 && (
                <div className="space-y-2">
                  <Label htmlFor="library-path">Library folder</Label>
                  <div className="flex gap-2">
                    <Input
                      id="library-path"
                      readOnly
                      value={libraryPath}
                      placeholder="/Users/you/AstroLog"
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={browseLibrary}>
                      <FolderOpen className="size-4" />
                      Browse
                    </Button>
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FolderPlus className="size-3.5" />
                    Empty folder creates a new library. A folder with{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-[11px]">.astrolog</code>{" "}
                    opens an existing one.
                  </p>
                </div>
              )}

              {current === 3 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Measurement system</Label>
                    <ToggleGroup
                      type="single"
                      value={unit}
                      onValueChange={(v) => v && setUnit(v as Unit)}
                      className="grid grid-cols-2 gap-2"
                    >
                      <ToggleGroupItem value="METRIC" className="gap-2">
                        <Ruler className="size-4" />
                        Metric
                      </ToggleGroupItem>
                      <ToggleGroupItem value="IMPERIAL" className="gap-2">
                        <Ruler className="size-4" />
                        Imperial
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <ToggleGroup
                      type="single"
                      value={theme}
                      onValueChange={(v) => v && setTheme(v as ThemeMode)}
                      className="grid grid-cols-3 gap-2"
                    >
                      <ToggleGroupItem value="DARK" className="gap-2">
                        <Moon className="size-4" />
                        Dark
                      </ToggleGroupItem>
                      <ToggleGroupItem value="WHITE" className="gap-2">
                        <Sun className="size-4" />
                        Light
                      </ToggleGroupItem>
                      <ToggleGroupItem value="SYSTEM" className="gap-2">
                        <Monitor className="size-4" />
                        System
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>
              )}

              {current === 4 && (
                <div className="space-y-2">
                  <Label htmlFor="star-db-path">Star database folder</Label>
                  <div className="flex gap-2">
                    <Input
                      id="star-db-path"
                      readOnly
                      value={starDbPath}
                      placeholder="Optional — e.g. /Users/you/astrometry"
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={browseStarDb}>
                      <FolderOpen className="size-4" />
                      Browse
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can skip this and configure plate solving later in settings.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 space-y-3">
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={back}
                disabled={current === 1 || finishing}
                className={cn(current === 1 && "invisible")}
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>

              {current < total ? (
                <Button onClick={next} disabled={current === 2 && !libraryPath}>
                  Continue
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button onClick={finish} disabled={finishing}>
                  {finishing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  Finish setup
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
