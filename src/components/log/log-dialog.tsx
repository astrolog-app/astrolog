"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FRAME_TYPES, type LogEntry, type LogKind, type FrameType } from "@/lib/log"

interface LogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: LogKind
  onSave: (entry: LogEntry) => void
}

const empty = {
  target: "",
  date: new Date().toISOString().slice(0, 10),
  frameType: "Light" as FrameType,
  filter: "",
  frameCount: "",
  exposure: "",
  telescope: "",
  camera: "",
  gain: "",
  binning: "1x1",
}

export function LogDialog({ open, onOpenChange, kind, onSave }: LogDialogProps) {
  const [form, setForm] = useState({ ...empty })
  const isSession = kind === "session"

  function set(key: keyof typeof empty, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSave() {
    const frameCount = Number(form.frameCount) || 0
    const exposure = Number(form.exposure) || 0
    const entry: LogEntry = {
      id: `${kind}-${Date.now()}`,
      kind,
      target: form.target || (isSession ? "Untitled Target" : "Untitled Calibration"),
      date: form.date,
      frameType: isSession ? "Light" : form.frameType,
      frameCount,
      exposure,
      totalIntegration: Math.round((frameCount * exposure) / 60),
      filter: form.filter || "—",
      telescope: form.telescope || "—",
      camera: form.camera || "—",
      gain: Number(form.gain) || 0,
      offset: 0,
      binning: form.binning,
      sensorTemp: 0,
      images: [],
    }
    onSave(entry)
    setForm({ ...empty })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isSession ? "New Imaging Session" : "New Calibration Frame"}</DialogTitle>
          <DialogDescription>
            {isSession
              ? "Log a night of captured light frames for a target."
              : "Log a set of calibration frames (darks, flats or bias)."}
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="target">{isSession ? "Target" : "Name"}</FieldLabel>
              <Input
                id="target"
                value={form.target}
                onChange={(e) => set("target", e.target.value)}
                placeholder={isSession ? "M31 Andromeda" : "Master Darks"}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="date">Date</FieldLabel>
              <Input id="date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
          </div>

          {!isSession && (
            <Field>
              <FieldLabel htmlFor="frameType">Frame Type</FieldLabel>
              <Select value={form.frameType} onValueChange={(v) => set("frameType", v)}>
                <SelectTrigger id="frameType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {FRAME_TYPES.filter((t) => t !== "Light").map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}

          <FieldSet>
            <FieldLegend>Capture</FieldLegend>
            <div className="grid grid-cols-3 gap-4">
              <Field>
                <FieldLabel htmlFor="frameCount">Frames</FieldLabel>
                <Input id="frameCount" type="number" value={form.frameCount} onChange={(e) => set("frameCount", e.target.value)} placeholder="60" />
              </Field>
              <Field>
                <FieldLabel htmlFor="exposure">Exposure (s)</FieldLabel>
                <Input id="exposure" type="number" value={form.exposure} onChange={(e) => set("exposure", e.target.value)} placeholder="300" />
              </Field>
              <Field>
                <FieldLabel htmlFor="filter">Filter</FieldLabel>
                <Input id="filter" value={form.filter} onChange={(e) => set("filter", e.target.value)} placeholder="L" />
              </Field>
            </div>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Equipment</FieldLegend>
            <div className="grid grid-cols-2 gap-4">
              {isSession && (
                <Field>
                  <FieldLabel htmlFor="telescope">Telescope</FieldLabel>
                  <Input id="telescope" value={form.telescope} onChange={(e) => set("telescope", e.target.value)} placeholder="Esprit 100ED" />
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="camera">Camera</FieldLabel>
                <Input id="camera" value={form.camera} onChange={(e) => set("camera", e.target.value)} placeholder="ASI2600MM Pro" />
              </Field>
              <Field>
                <FieldLabel htmlFor="gain">Gain</FieldLabel>
                <Input id="gain" type="number" value={form.gain} onChange={(e) => set("gain", e.target.value)} placeholder="100" />
              </Field>
            </div>
          </FieldSet>
        </FieldGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{isSession ? "Add Session" : "Add Calibration"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
