export type LogKind = "session" | "calibration"

export type FrameType = "Light" | "Dark" | "Flat" | "Dark Flat" | "Bias"

export interface LogImage {
  id: string
  /** descriptive label, no real image is imported */
  label: string
  frameType: FrameType
  /** deterministic hue so placeholders look distinct */
  hue: number
}

export interface LogEntry {
  id: string
  kind: LogKind
  // --- core / simple view ---
  target: string
  date: string
  frameType: FrameType
  frameCount: number
  exposure: number // seconds
  totalIntegration: number // minutes
  filter: string
  // --- detailed view ---
  telescope: string
  camera: string
  gain: number
  offset: number
  binning: string
  sensorTemp: number // °C
  // individual frames, shown in the preview panel
  images: LogImage[]
}

export interface ColumnDef {
  key: keyof LogEntry
  label: string
  /** shown in the beautiful simple view */
  simple?: boolean
  unit?: string
  align?: "left" | "right"
}

/** Columns for imaging sessions — sky / acquisition oriented. */
export const SESSION_COLUMNS: ColumnDef[] = [
  { key: "target", label: "Target", simple: true },
  { key: "date", label: "Date", simple: true },
  { key: "filter", label: "Filter", simple: true },
  { key: "frameCount", label: "Frames", simple: true, align: "right" },
  { key: "exposure", label: "Exposure", simple: true, unit: "s", align: "right" },
  { key: "totalIntegration", label: "Integration", simple: true, unit: "min", align: "right" },
  { key: "frameType", label: "Frame" },
  { key: "telescope", label: "Telescope" },
  { key: "camera", label: "Camera" },
  { key: "gain", label: "Gain", align: "right" },
  { key: "offset", label: "Offset", align: "right" },
  { key: "binning", label: "Binning" },
  { key: "sensorTemp", label: "Sensor Temp", unit: "°C", align: "right" },
]

/** Columns for calibration frames — no sky metrics, gear/sensor oriented. */
export const CALIBRATION_COLUMNS: ColumnDef[] = [
  { key: "target", label: "Name", simple: true },
  { key: "frameType", label: "Type", simple: true },
  { key: "date", label: "Date", simple: true },
  { key: "frameCount", label: "Frames", simple: true, align: "right" },
  { key: "exposure", label: "Exposure", simple: true, unit: "s", align: "right" },
  { key: "gain", label: "Gain", simple: true, align: "right" },
  { key: "camera", label: "Camera" },
  { key: "telescope", label: "Telescope" },
  { key: "filter", label: "Filter" },
  { key: "offset", label: "Offset", align: "right" },
  { key: "binning", label: "Binning" },
  { key: "sensorTemp", label: "Sensor Temp", unit: "°C", align: "right" },
]

export function columnsFor(kind: LogKind): ColumnDef[] {
  return kind === "session" ? SESSION_COLUMNS : CALIBRATION_COLUMNS
}

export const FRAME_TYPES: FrameType[] = ["Light", "Dark", "Flat", "Dark Flat", "Bias"]

// ---- subframes: the individual exposures that make up one grouped row ----

export interface SubFrame {
  id: string
  index: number
  fileName: string
  capturedAt: string // "HH:MM:SS"
  exposure: number // seconds
  gain: number
  offset: number
  binning: string
  sensorTemp: number // °C
  accepted: boolean
}

export interface SubFrameColumn {
  key: keyof SubFrame
  label: string
  unit?: string
  align?: "left" | "right"
}

export const SUBFRAME_COLUMNS: SubFrameColumn[] = [
  { key: "index", label: "#", align: "right" },
  { key: "fileName", label: "File" },
  { key: "capturedAt", label: "Captured" },
  { key: "exposure", label: "Exposure", unit: "s", align: "right" },
  { key: "gain", label: "Gain", align: "right" },
  { key: "offset", label: "Offset", align: "right" },
  { key: "binning", label: "Binning" },
  { key: "sensorTemp", label: "Sensor Temp", unit: "°C", align: "right" },
  { key: "accepted", label: "Status" },
]

// tiny deterministic PRNG so dummy subframes are stable across renders (no
// hydration mismatch) — seeded from the entry id
function seededRandom(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function hashString(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

const FRAME_TYPE_PREFIX: Record<FrameType, string> = {
  Light: "LIGHT",
  Dark: "DARK",
  Flat: "FLAT",
  "Dark Flat": "DARKFLAT",
  Bias: "BIAS",
}

/** Build a dummy set of individual subframes for one grouped log entry. */
export function makeSubFrames(entry: LogEntry): SubFrame[] {
  const rand = seededRandom(hashString(entry.id) + entry.frameCount)
  const prefix = FRAME_TYPE_PREFIX[entry.frameType]
  const slug = entry.target.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "") || "FRAME"
  const baseTemp = entry.sensorTemp || -10

  return Array.from({ length: entry.frameCount }, (_, i) => {
    const seq = String(i + 1).padStart(4, "0")
    const totalMinutes = Math.floor(rand() * 360) + i * 2
    const hh = String((20 + Math.floor(totalMinutes / 60)) % 24).padStart(2, "0")
    const mm = String(totalMinutes % 60).padStart(2, "0")
    const ss = String(Math.floor(rand() * 60)).padStart(2, "0")
    return {
      id: `${entry.id}#${i}`,
      index: i + 1,
      fileName: `${slug}_${prefix}_${seq}.fits`,
      capturedAt: `${hh}:${mm}:${ss}`,
      exposure: entry.exposure,
      gain: entry.gain,
      offset: entry.offset,
      binning: entry.binning,
      sensorTemp: +(baseTemp + (rand() - 0.5)).toFixed(1),
      // no frame analysis yet, so every subframe is accepted for now
      accepted: true,
    }
  })
}

/** Build the preview images for one grouped log entry from its subframes, so
 *  selecting a row shows the individual frames it contains. Placeholder star
 *  fields get a deterministic per-frame hue (no real image is imported). */
export function makeImages(entry: LogEntry): LogImage[] {
  const frames = makeSubFrames(entry)
  const baseHue = hashString(entry.id) % 360
  return frames.map((frame, i) => ({
    id: frame.id,
    label: frame.fileName,
    frameType: entry.frameType,
    // spread hues slightly around the entry's base so frames look distinct
    hue: (baseHue + i * 12) % 360,
  }))
}

export function formatSubCell(frame: SubFrame, col: SubFrameColumn): string {
  const value = frame[col.key]
  if (typeof value === "boolean") return value ? "Accepted" : "Rejected"
  return col.unit ? `${value}${col.unit}` : String(value)
}

export function formatCell(entry: LogEntry, col: ColumnDef): string {
  const value = entry[col.key]
  // calibration frames without a regulated temp report 0 — show a dash
  if (value === 0 && col.key === "sensorTemp") return "—"
  return col.unit ? `${value}${col.unit}` : String(value)
}
