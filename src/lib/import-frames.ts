import type { LogImage } from "@/lib/log"

// per-frame validation outcome shown in the review step
export type FrameStatus = "ok" | "warning" | "error"

export interface ImportFrame {
  id: string
  index: number
  fileName: string
  capturedAt: string // "HH:MM:SS"
  exposure: number // seconds
  gain: number
  offset: number
  binning: string
  sensorTemp: number // °C
  status: FrameStatus
  // human readable reasons; errors block the import, warnings are advisory
  messages: string[]
  // faux preview backdrop (no real image is decoded yet)
  image: LogImage
}

export interface ImportColumn {
  key: keyof ImportFrame
  label: string
  unit?: string
  align?: "left" | "right"
}

export const IMPORT_COLUMNS: ImportColumn[] = [
  { key: "index", label: "#", align: "right" },
  { key: "fileName", label: "File" },
  { key: "capturedAt", label: "Captured" },
  { key: "exposure", label: "Exposure", unit: "s", align: "right" },
  { key: "gain", label: "Gain", align: "right" },
  { key: "offset", label: "Offset", align: "right" },
  { key: "binning", label: "Binning" },
  { key: "sensorTemp", label: "Sensor Temp", unit: "°C", align: "right" },
]

// tiny deterministic PRNG so mock frames are stable across renders
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

// pull a clean base name out of an absolute path returned by the file picker
function baseName(path: string): string {
  const parts = path.split(/[/\\]/)
  return parts[parts.length - 1] || path
}

/**
 * Build the list of frames to review. When the native picker returned file
 * paths we map those 1:1; otherwise we synthesize a demo set for the web mock.
 * Real FITS header parsing / analysis is not wired up yet, so the exposure,
 * temps and validation results are generated deterministically.
 */
export function makeImportFrames(files: string[], night: string): ImportFrame[] {
  const names =
    files.length > 0
      ? files.map(baseName)
      : Array.from({ length: 12 }, (_, i) => `LIGHT_${String(i + 1).padStart(4, "0")}.fits`)

  const rand = seededRandom(hashString(names.join("|") + night) + names.length)
  const baseExposure = 120
  const baseGain = 100
  const baseTemp = -10

  return names.map((fileName, i) => {
    const seq = i + 1
    const totalMinutes = Math.floor(rand() * 40) + i * 3
    const hh = String((21 + Math.floor(totalMinutes / 60)) % 24).padStart(2, "0")
    const mm = String(totalMinutes % 60).padStart(2, "0")
    const ss = String(Math.floor(rand() * 60)).padStart(2, "0")

    const messages: string[] = []
    let status: FrameStatus = "ok"

    // ~1 in 8 frames can't be read at all -> hard error
    const roll = rand()
    const unreadable = roll < 0.12
    // a couple of soft issues -> warning
    const highTemp = +(baseTemp + (rand() - 0.3) * 6).toFixed(1)
    const exposure = unreadable ? 0 : baseExposure
    const gain = baseGain
    const offset = 30

    if (unreadable) {
      status = "error"
      messages.push(`Can't read file "${fileName}" — header is missing or corrupt.`)
    } else {
      if (highTemp > -7) {
        status = "warning"
        messages.push(`Sensor temperature ${highTemp}°C is warmer than the set point (-10°C).`)
      }
      if (roll > 0.82) {
        status = "warning"
        messages.push("Exposure differs from the rest of the set.")
      }
    }

    return {
      id: `${fileName}#${i}`,
      index: seq,
      fileName,
      capturedAt: unreadable ? "—" : `${hh}:${mm}:${ss}`,
      exposure,
      gain,
      offset,
      binning: "1x1",
      sensorTemp: highTemp,
      status,
      messages,
      image: {
        id: `${fileName}#img`,
        label: fileName,
        frameType: "Light",
        hue: (hashString(fileName) % 360),
      },
    }
  })
}

export function formatImportCell(frame: ImportFrame, col: ImportColumn): string {
  const value = frame[col.key]
  if (value === "—") return "—"
  return col.unit ? `${value}${col.unit}` : String(value)
}
