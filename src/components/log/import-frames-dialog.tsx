"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { useAppState } from "@/context/state-provider"
import { ImportReview } from "@/components/log/import-review"
import { ImportLibraryStep, type LibrarySelection } from "@/components/log/import-library-step"
import { isDslr, makeImportFrames, type ImportFrameType } from "@/lib/import-frames"
import { cn } from "@/lib/utils"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import type { UUID } from "crypto"

// every step renders a distinct panel; review steps import frames from files,
// the library step matches existing calibration groups to the session
type StepId = "settings" | "lights" | "flats" | "darks" | "library"

interface StepDef {
  id: StepId
  label: string
  // review steps carry the frame type they collect from disk
  frameType?: ImportFrameType
}

interface ImportFramesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // paths returned by the native file picker (desktop only; empty in the web mock)
  files?: string[]
}

// the general settings + equipment mapping the user picks on the first step
interface FrameMeta {
  night: string
  telescopeId: string
  cameraId: string
  mountId: string
  filterId: string
  flattenerId: string
}

const EMPTY_META: FrameMeta = {
  night: "",
  telescopeId: "",
  cameraId: "",
  mountId: "",
  filterId: "",
  flattenerId: "",
}

const EMPTY_SELECTION: LibrarySelection = { bias: [], darks: [] }

export function ImportFramesDialog({ open, onOpenChange, files = [] }: ImportFramesDialogProps) {
  const { appState } = useAppState()
  const [stepIndex, setStepIndex] = useState(0)
  const [meta, setMeta] = useState<FrameMeta>(EMPTY_META)
  const [library, setLibrary] = useState<LibrarySelection>(EMPTY_SELECTION)

  // reset to a clean first step whenever the dialog is (re)opened
  useEffect(() => {
    if (!open) return
    setStepIndex(0)
    setMeta(EMPTY_META)
    setLibrary(EMPTY_SELECTION)
  }, [open])

  // equipment records come back keyed by UUID; turn them into sorted options
  const equipment = appState?.equipment
  const telescopes = useMemo(() => toOptions(equipment?.telescopes), [equipment])
  const cameras = useMemo(() => toOptions(equipment?.cameras), [equipment])
  const mounts = useMemo(() => toOptions(equipment?.mounts), [equipment])
  const filters = useMemo(() => toOptions(equipment?.filters), [equipment])
  const flatteners = useMemo(() => toOptions(equipment?.flatteners), [equipment])

  const setField = (key: keyof FrameMeta, value: string) =>
    setMeta((prev) => ({ ...prev, [key]: value }))

  // a DSLR shoots matched darks each session (imported from files); a cooled
  // astro camera reuses a dark library, so its darks come from the library step
  const cameraIsDslr = isDslr(meta.cameraId ? equipment?.cameras[meta.cameraId as UUID]?.sensor_type : undefined)

  // the wizard is built dynamically: the darks-from-files step only exists for
  // a DSLR, and the library step covers bias (+ darks for cooled cameras)
  const steps = useMemo<StepDef[]>(() => {
    const list: StepDef[] = [
      { id: "settings", label: "Settings" },
      { id: "lights", label: "Lights", frameType: "Light" },
      { id: "flats", label: "Flats", frameType: "Flat" },
    ]
    if (cameraIsDslr) list.push({ id: "darks", label: "Darks", frameType: "Dark" })
    list.push({ id: "library", label: "Library" })
    return list
  }, [cameraIsDslr])

  // stepIndex can outrun the list when the camera type shrinks it (dslr -> cooled)
  const safeIndex = Math.min(stepIndex, steps.length - 1)
  const step = steps[safeIndex]
  const isFirst = safeIndex === 0
  const isLast = safeIndex === steps.length - 1

  // telescope, camera and mount are required to identify a frame; the filter
  // and flattener are optional (mono vs. one-shot color, etc.)
  const settingsValid = Boolean(meta.night && meta.telescopeId && meta.cameraId && meta.mountId)

  // review frames for the current file-review step (analysis is mocked)
  const reviewFrames = useMemo(
    () => (step.frameType ? makeImportFrames(files, meta.night, step.frameType) : []),
    [step.frameType, files, meta.night],
  )

  // importable light frames gate the final Import action
  const importableLights = useMemo(
    () => makeImportFrames(files, meta.night, "Light").filter((f) => f.status !== "error").length,
    [files, meta.night],
  )

  const canAdvance = step.id === "settings" ? settingsValid : true

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[88vh] w-[min(96vw,72rem)] max-w-none flex-col gap-4 sm:max-w-none"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>Import Frames</DialogTitle>
          <DialogDescription>{descriptionFor(step.id, cameraIsDslr)}</DialogDescription>
        </DialogHeader>

        {/* step indicator */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          {steps.map((s, i) => (
            <div key={s.id} className="flex flex-1 items-center gap-2 last:flex-none">
              <StepDot
                n={i + 1}
                label={s.label}
                active={i === safeIndex}
                done={i < safeIndex}
              />
              {i < steps.length - 1 && <div className="h-px flex-1 bg-border" />}
            </div>
          ))}
        </nav>

        {/* body */}
        <div className="min-h-0 flex-1">
          {step.id === "settings" ? (
            <div className="h-full overflow-y-auto pr-1">
              <div className="flex flex-col gap-6">
                <FieldSet>
                  <FieldLegend variant="label">General</FieldLegend>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="import-night">Imaging Night</FieldLabel>
                      <Input
                        id="import-night"
                        type="date"
                        value={meta.night}
                        onChange={(e) => setField("night", e.target.value)}
                      />
                    </Field>
                  </FieldGroup>
                </FieldSet>

                <FieldSet>
                  <FieldLegend variant="label">Equipment</FieldLegend>
                  <FieldGroup>
                    <EquipmentSelect
                      id="import-telescope"
                      label="Telescope"
                      placeholder="Select a telescope…"
                      options={telescopes}
                      value={meta.telescopeId}
                      onChange={(v) => setField("telescopeId", v)}
                    />
                    <EquipmentSelect
                      id="import-camera"
                      label="Camera"
                      placeholder="Select a camera…"
                      options={cameras}
                      value={meta.cameraId}
                      onChange={(v) => setField("cameraId", v)}
                    />
                    <EquipmentSelect
                      id="import-mount"
                      label="Mount"
                      placeholder="Select a mount…"
                      options={mounts}
                      value={meta.mountId}
                      onChange={(v) => setField("mountId", v)}
                    />
                    <EquipmentSelect
                      id="import-filter"
                      label="Filter"
                      optional
                      placeholder="Select a filter…"
                      options={filters}
                      value={meta.filterId}
                      onChange={(v) => setField("filterId", v)}
                    />
                    <EquipmentSelect
                      id="import-flattener"
                      label="Flattener"
                      optional
                      placeholder="Select a flattener…"
                      options={flatteners}
                      value={meta.flattenerId}
                      onChange={(v) => setField("flattenerId", v)}
                    />
                  </FieldGroup>
                </FieldSet>
              </div>
            </div>
          ) : step.id === "library" ? (
            <div className="h-full overflow-y-auto pr-1">
              <ImportLibraryStep
                cameraId={meta.cameraId}
                includeDarks={!cameraIsDslr}
                selection={library}
                onChange={setLibrary}
              />
            </div>
          ) : (
            <ImportReview frames={reviewFrames} />
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {!isFirst && (
              <Button type="button" variant="outline" onClick={() => setStepIndex(safeIndex - 1)}>
                <ArrowLeft data-icon="inline-start" />
                Back
              </Button>
            )}
          </div>
          {isLast ? (
            <Button type="button" disabled={importableLights === 0}>
              <Check data-icon="inline-start" />
              Import {importableLights > 0 ? `${importableLights} ` : ""}light
              {importableLights === 1 ? "" : "s"}
            </Button>
          ) : (
            <Button type="button" disabled={!canAdvance} onClick={() => setStepIndex(safeIndex + 1)}>
              Continue
              <ArrowRight data-icon="inline-end" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function descriptionFor(id: StepId, dslr: boolean): string {
  switch (id) {
    case "settings":
      return "Set the general settings and equipment used for this imaging session."
    case "lights":
      return "Review the light frames before adding them to your log."
    case "flats":
      return "Select and review the flat frames captured for this session."
    case "darks":
      return "Select and review the dark frames captured for this DSLR session."
    case "library":
      return dslr
        ? "Match bias frames from your library to this session."
        : "Match dark and bias frames from your library to this session."
  }
}

interface Option {
  id: string
  label: string
}

// flatten a Record<UUID, {brand,name}> into label/value options, sorted by label
function toOptions(record?: Record<UUID, { brand: string; name: string }>): Option[] {
  if (!record) return []
  return Object.entries(record)
    .map(([id, item]) => ({ id, label: `${item.brand} ${item.name}`.trim() }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

function EquipmentSelect({
                           id,
                           label,
                           placeholder,
                           options,
                           value,
                           onChange,
                           optional,
                         }: {
  id: string
  label: string
  placeholder: string
  options: Option[]
  value: string
  onChange: (value: string) => void
  optional?: boolean
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {label}
        {optional ? <span className="text-muted-foreground"> (optional)</span> : null}
      </FieldLabel>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full" disabled={options.length === 0}>
          <SelectValue placeholder={options.length === 0 ? "None available" : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

function StepDot({
                   n,
                   label,
                   active,
                   done,
                 }: {
  n: number
  label: string
  active: boolean
  done: boolean
}) {
  return (
    <span className="flex items-center gap-1.5" data-state={active ? "active" : done ? "done" : "idle"}>
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-full text-[10px] font-medium",
          active || done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        {done ? <Check className="size-3" /> : n}
      </span>
      <span className={active ? "font-medium text-foreground" : ""}>{label}</span>
    </span>
  )
}
