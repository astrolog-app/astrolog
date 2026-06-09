export type LogKind = "session" | "calibration"

export type FrameType = "Light" | "Dark" | "Flat" | "Bias"

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

export const INITIAL_LOG: LogEntry[] = [
  {
    id: "s1",
    kind: "session",
    target: "M31 Andromeda",
    date: "2025-09-14",
    frameType: "Light",
    frameCount: 120,
    exposure: 300,
    totalIntegration: 600,
    filter: "L",
    telescope: "Esprit 100ED",
    camera: "ASI2600MM Pro",
    mount: "EQ6-R Pro",
    flattener: "Esprit Flattener",
    gain: 100,
    offset: 50,
    binning: "1x1",
    sensorTemp: -10,
    ambientTemp: 12,
    fwhm: 2.4,
    hfr: 1.8,
    sqm: 21.2,
    bortle: 4,
    moonIllum: 8,
    seeing: "Good",
    transparency: "Above Average",
    location: "Backyard Observatory",
    guideRms: 0.62,
    filePath: "DATA/M31/2025-09-14/Lights/L/300s",
    processed: true,
    notes: "Clear night, minimal wind. Excellent guiding.",
    images: makeImages("M31", "Light", 8, 210),
  },
  {
    id: "s2",
    kind: "session",
    target: "NGC 7000 North America",
    date: "2025-09-21",
    frameType: "Light",
    frameCount: 90,
    exposure: 300,
    totalIntegration: 450,
    filter: "Ha",
    telescope: "Esprit 100ED",
    camera: "ASI2600MM Pro",
    mount: "EQ6-R Pro",
    flattener: "Esprit Flattener",
    gain: 100,
    offset: 50,
    binning: "1x1",
    sensorTemp: -10,
    ambientTemp: 9,
    fwhm: 2.7,
    hfr: 2.1,
    sqm: 20.8,
    bortle: 5,
    moonIllum: 24,
    seeing: "Average",
    transparency: "Average",
    location: "Backyard Observatory",
    guideRms: 0.74,
    filePath: "DATA/NGC7000/2025-09-21/Lights/Ha/300s",
    processed: false,
    notes: "Some high clouds in second half.",
    images: makeImages("NGC7000", "Light", 6, 20),
  },
  {
    id: "s3",
    kind: "session",
    target: "M42 Orion Nebula",
    date: "2025-10-02",
    frameType: "Light",
    frameCount: 60,
    exposure: 120,
    totalIntegration: 120,
    filter: "OIII",
    telescope: "EdgeHD 8",
    camera: "ASI533MC Pro",
    mount: "EQ6-R Pro",
    flattener: "Reducer 0.7x",
    gain: 100,
    offset: 30,
    binning: "1x1",
    sensorTemp: -5,
    ambientTemp: 6,
    fwhm: 3.1,
    hfr: 2.4,
    sqm: 20.1,
    bortle: 6,
    moonIllum: 60,
    seeing: "Poor",
    transparency: "Below Average",
    location: "Driveway",
    guideRms: 0.95,
    filePath: "DATA/M42/2025-10-02/Lights/OIII/120s",
    processed: false,
    notes: "Bright moon, short subs to limit blooming.",
    images: makeImages("M42", "Light", 5, 140),
  },
  {
    id: "c1",
    kind: "calibration",
    target: "Master Darks",
    date: "2025-09-01",
    frameType: "Dark",
    frameCount: 50,
    exposure: 300,
    totalIntegration: 250,
    filter: "—",
    telescope: "—",
    camera: "ASI2600MM Pro",
    mount: "—",
    flattener: "—",
    gain: 100,
    offset: 50,
    binning: "1x1",
    sensorTemp: -10,
    ambientTemp: 20,
    fwhm: 0,
    hfr: 0,
    sqm: 0,
    bortle: 0,
    moonIllum: 0,
    seeing: "—",
    transparency: "—",
    location: "Indoor",
    guideRms: 0,
    filePath: "CALIBRATION/Darks/300s_gain100_-10C",
    processed: true,
    notes: "Reusable dark library at -10°C.",
    images: makeImages("Dark", "Dark", 4, 0),
  },
  {
    id: "c2",
    kind: "calibration",
    target: "Flats Ha",
    date: "2025-09-14",
    frameType: "Flat",
    frameCount: 30,
    exposure: 3,
    totalIntegration: 2,
    filter: "Ha",
    telescope: "Esprit 100ED",
    camera: "ASI2600MM Pro",
    mount: "—",
    flattener: "Esprit Flattener",
    gain: 100,
    offset: 50,
    binning: "1x1",
    sensorTemp: -10,
    ambientTemp: 18,
    fwhm: 0,
    hfr: 0,
    sqm: 0,
    bortle: 0,
    moonIllum: 0,
    seeing: "—",
    transparency: "—",
    location: "Indoor",
    guideRms: 0,
    filePath: "CALIBRATION/Flats/Ha_gain100",
    processed: true,
    notes: "Sky flats at dusk.",
    images: makeImages("Flat", "Flat", 3, 50),
  },
  {
    id: "c3",
    kind: "calibration",
    target: "Master Bias",
    date: "2025-09-01",
    frameType: "Bias",
    frameCount: 100,
    exposure: 0,
    totalIntegration: 0,
    filter: "—",
    telescope: "—",
    camera: "ASI2600MM Pro",
    mount: "—",
    flattener: "—",
    gain: 100,
    offset: 50,
    binning: "1x1",
    sensorTemp: -10,
    ambientTemp: 20,
    fwhm: 0,
    hfr: 0,
    sqm: 0,
    bortle: 0,
    moonIllum: 0,
    seeing: "—",
    transparency: "—",
    location: "Indoor",
    guideRms: 0,
    filePath: "CALIBRATION/Bias/gain100",
    processed: true,
    notes: "Bias library.",
    images: makeImages("Bias", "Bias", 3, 280),
  },
]

export const FRAME_TYPES: FrameType[] = ["Light", "Dark", "Flat", "Bias"]

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
