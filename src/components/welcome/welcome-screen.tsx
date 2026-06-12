"use client"

import { useState } from "react"
import {
  Telescope,
  FolderOpen,
  Camera,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Step = {
  id: number
  title: string
  description: string
  icon: React.ElementType
}

const STEPS: Step[] = [
  {
    id: 1,
    title: "Welcome to AstroLog",
    description: "Set up your workspace to start logging your astrophotography sessions.",
    icon: Sparkles,
  },
  {
    id: 2,
    title: "Choose your library",
    description: "Pick the folder where AstroLog stores your imaging frames and database.",
    icon: FolderOpen,
  },
  {
    id: 3,
    title: "Add your first gear",
    description: "Register a telescope or camera so your sessions are linked to equipment.",
    icon: Camera,
  },
]

export function WelcomeScreen() {
  const [current, setCurrent] = useState(1)
  const total = STEPS.length
  const progress = (current / total) * 100
  const active = STEPS[current - 1]

  const next = () => setCurrent((c) => Math.min(c + 1, total))
  const back = () => setCurrent((c) => Math.max(c - 1, 1))

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
                        isActive &&
                        "border-primary bg-primary/10 text-primary",
                        !done && !isActive &&
                        "border-border bg-card text-muted-foreground",
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
                      {step.id === 1 ? "Welcome" : step.id === 2 ? "Library" : "Equipment"}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* Step content */}
          <div className="min-h-[180px]">
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
                      placeholder="/Users/you/AstroLog"
                      className="flex-1"
                    />
                    <Button variant="outline" size="default">
                      <FolderOpen className="size-4" />
                      Browse
                    </Button>
                  </div>
                </div>
              )}

              {current === 3 && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="gear-name">Equipment name</Label>
                    <Input id="gear-name" placeholder="e.g. Sky-Watcher Esprit 100ED" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can add more telescopes, cameras, mounts and filters later.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={back}
              disabled={current === 1}
              className={cn(current === 1 && "invisible")}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>

            {current < total ? (
              <Button onClick={next}>
                Continue
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button>
                <Check className="size-4" />
                Finish setup
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
