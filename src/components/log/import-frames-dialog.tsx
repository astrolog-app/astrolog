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
import { makeImportFrames } from "@/lib/import-frames"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { UUID } from "crypto"

// the wizard steps; step 1 collects the shared metadata for every selected
// light frame, step 2 (built later) will review the individual frames
type Step = 1 | 2

interface ImportFramesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // paths returned by the native file picker (desktop only; empty in the web mock)
  files?: string[]
}

// the general settings + equipment mapping the user picks on step 1
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

export function ImportFramesDialog({ open, onOpenChange, files = [] }: ImportFramesDialogProps) {
  const { appState } = useAppState()
  const [step, setStep] = useState<Step>(1)
  const [meta, setMeta] = useState<FrameMeta>(EMPTY_META)

  // reset to a clean first step whenever the dialog is (re)opened
  useEffect(() => {
    if (!open) return
    setStep(1)
    setMeta(EMPTY_META)
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

  // telescope, camera and mount are required to identify a light frame; the
  // filter and flattener are optional (mono vs. one-shot color, etc.)
  const canContinue = Boolean(meta.night && meta.telescopeId && meta.cameraId && meta.mountId)

  // build the review set once we reach step 2 (frame analysis is mocked)
  const frames = useMemo(
    () => (step === 2 ? makeImportFrames(files, meta.night) : []),
    [step, files, meta.night],
  )
  const importableCount = frames.filter((f) => f.status !== "error").length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={step === 2 ? "sm:max-w-4xl" : "sm:max-w-lg"}>
        <DialogHeader>
          <DialogTitle>Import Light Frames</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Set the general settings and equipment used for the selected light frames."
              : "Review the frames before adding them to your log."}
          </DialogDescription>
        </DialogHeader>

        {/* step indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <StepDot active={step === 1} done={step > 1} label="Settings" />
          <div className="h-px flex-1 bg-border" />
          <StepDot active={step === 2} done={false} label="Review" />
        </div>

        {files.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">{files.length}</span> file
            {files.length === 1 ? "" : "s"} selected.
          </p>
        ) : null}

        {step === 1 ? (
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
        ) : (
          <ImportReview frames={frames} />
        )}

        <DialogFooter>
          {step === 1 ? (
            <>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" disabled={!canContinue} onClick={() => setStep(2)}>
                Continue
                <ArrowRight data-icon="inline-end" />
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft data-icon="inline-start" />
                Back
              </Button>
              <Button type="button" disabled={importableCount === 0}>
                Import {importableCount > 0 ? importableCount : ""}
                {importableCount > 0 ? ` frame${importableCount === 1 ? "" : "s"}` : ""}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
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

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <span
      className="flex items-center gap-1.5"
      data-state={active ? "active" : done ? "done" : "idle"}
    >
      <span
        className={
          "flex size-5 items-center justify-center rounded-full text-[10px] font-medium " +
          (active || done
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground")
        }
      >
        {label === "Settings" ? "1" : "2"}
      </span>
      <span className={active ? "font-medium text-foreground" : ""}>{label}</span>
    </span>
  )
}
