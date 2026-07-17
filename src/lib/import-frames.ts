import type { LogImage } from "@/lib/log"
import type { FrameType } from "@/lib/log"

// per-frame validation outcome shown in the review step
export type FrameStatus = "ok" | "warning" | "error"

// the frame types imported directly from files during a session import
export type ImportFrameType = "Light" | "Flat" | "Dark"

// cooled astro cameras ("Mono"/"OSC") reuse dark + bias libraries; an uncooled
// DSLR shoots matched darks per session, so its darks are imported from files
export function isDslr(sensorType: string | undefined): boolean {
  return (sensorType ?? "").trim().toUpperCase() === "DSLR"
}

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

// per-type generation defaults for the mock (file prefix, count, exposure, …)
const FRAME_PRESETS: Record<
  ImportFrameType,
  { prefix: string; count: number; exposure: number; baseTemp: number; startHour: number }
> = {
  Light: { prefix: "LIGHT", count: 12, exposure: 120, baseTemp: -10, startHour: 21 },
  Flat: { prefix: "FLAT", count: 20, exposure: 3, baseTemp: -10, startHour: 8 },
  Dark: { prefix: "DARK", count: 10, exposure: 120, baseTemp: -10, startHour: 10 },
}

/**
 * Build the list of frames to review for a given frame type. When the native
 * picker returned file paths we map those 1:1; otherwise we synthesize a demo
 * set for the web mock. Real FITS header parsing / analysis is not wired up
 * yet, so the exposure, temps and validation results are generated
 * deterministically per frame type.
 */
export function makeImportFrames(
  files: string[],
  night: string,
  frameType: ImportFrameType = "Light",
): ImportFrame[] {
  const preset = FRAME_PRESETS[frameType]
  const names =
    files.length > 0
      ? files.map(baseName)
      : Array.from(
          { length: preset.count },
          (_, i) => `${preset.prefix}_${String(i + 1).padStart(4, "0")}.fits`,
        )

  const rand = seededRandom(hashString(names.join("|") + night + frameType) + names.length)
  const baseGain = 100

  return names.map((fileName, i) => {
    const seq = i + 1
    const totalMinutes = Math.floor(rand() * 40) + i * 3
    const hh = String((preset.startHour + Math.floor(totalMinutes / 60)) % 24).padStart(2, "0")
    const mm = String(totalMinutes % 60).padStart(2, "0")
    const ss = String(Math.floor(rand() * 60)).padStart(2, "0")

    const messages: string[] = []
    let status: FrameStatus = "ok"

    // ~1 in 8 frames can't be read at all -> hard error
    const roll = rand()
    const unreadable = roll < 0.12
    const highTemp = +(preset.baseTemp + (rand() - 0.3) * 6).toFixed(1)
    const exposure = unreadable ? 0 : preset.exposure
    const gain = baseGain
    const offset = 30

    if (unreadable) {
      status = "error"
      messages.push(`Can't read file "${fileName}" — header is missing or corrupt.`)
    } else if (frameType === "Flat") {
      // flats are judged on illumination level rather than temperature
      if (roll > 0.8) {
        status = "warning"
        messages.push("Median ADU is outside the recommended 20–40k range.")
      }
    } else {
      // lights + darks care about sensor temperature matching the set point
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
      id: `${frameType}:${fileName}#${i}`,
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
        frameType: frameType as FrameType,
        hue: hashString(fileName) % 360,
      },
    }
  })
}

export function formatImportCell(frame: ImportFrame, col: ImportColumn): string {
  const value = frame[col.key]
  if (value === "—") return "—"
  return col.unit ? `${value}${col.unit}` : String(value)
}
