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
  // --- detailed view (everything else) ---
  telescope: string
  camera: string
  mount: string
  flattener: string
  gain: number
  offset: number
  binning: string
  sensorTemp: number // °C
  ambientTemp: number // °C
  fwhm: number // arcsec
  hfr: number // px
  sqm: number // mag/arcsec²
  bortle: number
  moonIllum: number // %
  seeing: string
  transparency: string
  location: string
  guideRms: number // arcsec
  filePath: string
  processed: boolean
  notes: string
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
  { key: "mount", label: "Mount" },
  { key: "flattener", label: "Flattener" },
  { key: "gain", label: "Gain", align: "right" },
  { key: "offset", label: "Offset", align: "right" },
  { key: "binning", label: "Binning" },
  { key: "sensorTemp", label: "Sensor Temp", unit: "°C", align: "right" },
  { key: "ambientTemp", label: "Ambient", unit: "°C", align: "right" },
  { key: "fwhm", label: "FWHM", unit: '"', align: "right" },
  { key: "hfr", label: "HFR", unit: "px", align: "right" },
  { key: "sqm", label: "SQM", align: "right" },
  { key: "bortle", label: "Bortle", align: "right" },
  { key: "moonIllum", label: "Moon", unit: "%", align: "right" },
  { key: "seeing", label: "Seeing" },
  { key: "transparency", label: "Transparency" },
  { key: "location", label: "Location" },
  { key: "guideRms", label: "Guide RMS", unit: '"', align: "right" },
  { key: "filePath", label: "File Path" },
  { key: "processed", label: "Processed" },
  { key: "notes", label: "Notes" },
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
  { key: "ambientTemp", label: "Ambient", unit: "°C", align: "right" },
  { key: "filePath", label: "File Path" },
  { key: "processed", label: "Processed" },
  { key: "notes", label: "Notes" },
]

export function columnsFor(kind: LogKind): ColumnDef[] {
  return kind === "session" ? SESSION_COLUMNS : CALIBRATION_COLUMNS
}

function makeImages(target: string, frameType: FrameType, n: number, baseHue: number): LogImage[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${target}-${frameType}-${i}`,
    label: `${target} · ${frameType} ${String(i + 1).padStart(3, "0")}`,
    frameType,
    hue: (baseHue + i * 17) % 360,
  }))
}

export const FRAME_TYPES: FrameType[] = ["Light", "Dark", "Flat", "Dark Flat", "Bias"]

export function formatCell(entry: LogEntry, col: ColumnDef): string {
  const value = entry[col.key]
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (value === 0 && col.align === "right" && col.key !== "frameCount") {
    // keep zeros for counts but show dash for irrelevant metrics on calibration
    if (entry.kind === "calibration" && ["fwhm", "hfr", "sqm", "bortle", "moonIllum", "guideRms"].includes(col.key as string)) {
      return "—"
    }
  }
  return col.unit ? `${value}${col.unit}` : String(value)
}
