import type { LogEntry } from "@/lib/log"

export type CategoryId = "telescopes" | "cameras" | "mounts" | "filters" | "flatteners"

export type FieldType = "text" | "number" | "select"

export interface FieldDef {
  key: string
  label: string
  type: FieldType
  unit?: string
  options?: string[]
  placeholder?: string
}

export interface CategoryDef {
  id: CategoryId
  label: string
  /** singular noun used in buttons/dialogs */
  noun: string
  /** which LogEntry field references this equipment by name */
  logField: "telescope" | "camera" | "mount" | "flattener" | "filter"
  fields: FieldDef[]
}

export interface EquipmentItem {
  id: string
  category: CategoryId
  name: string
  brand: string
  [key: string]: string | number
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: "telescopes",
    label: "Telescopes",
    noun: "Telescope",
    logField: "telescope",
    fields: [
      { key: "type", label: "Type", type: "select", options: ["Refractor", "Reflector", "SCT", "RC", "Newtonian", "Maksutov"] },
      { key: "aperture", label: "Aperture", type: "number", unit: "mm", placeholder: "80" },
      { key: "focalLength", label: "Focal Length", type: "number", unit: "mm", placeholder: "480" },
      { key: "focalRatio", label: "Focal Ratio", type: "text", placeholder: "f/6" },
    ],
  },
  {
    id: "cameras",
    label: "Cameras",
    noun: "Camera",
    logField: "camera",
    fields: [
      { key: "type", label: "Sensor Type", type: "select", options: ["Monochrome", "Color (OSC)", "DSLR", "CCD"] },
      { key: "sensor", label: "Sensor", type: "text", placeholder: "Sony IMX571" },
      { key: "resolution", label: "Resolution", type: "text", placeholder: "6248 x 4176" },
      { key: "pixelSize", label: "Pixel Size", type: "number", unit: "µm", placeholder: "3.76" },
    ],
  },
  {
    id: "mounts",
    label: "Mounts",
    noun: "Mount",
    logField: "mount",
    fields: [
      { key: "type", label: "Type", type: "select", options: ["Equatorial (GEM)", "Alt-Azimuth", "Strain Wave", "Fork"] },
      { key: "payload", label: "Payload Capacity", type: "number", unit: "kg", placeholder: "20" },
      { key: "connection", label: "Connection", type: "select", options: ["USB", "WiFi", "Ethernet", "Serial"] },
    ],
  },
  {
    id: "filters",
    label: "Filters",
    noun: "Filter",
    logField: "filter",
    fields: [
      { key: "type", label: "Type", type: "select", options: ["Luminance", "Red", "Green", "Blue", "Ha", "OIII", "SII", "UHC", "Dual Band"] },
      { key: "size", label: "Size", type: "select", options: ['1.25"', '2"', "31mm", "36mm", "50mm"] },
      { key: "bandwidth", label: "Bandwidth", type: "text", placeholder: "3nm" },
    ],
  },
  {
    id: "flatteners",
    label: "Flatteners",
    noun: "Flattener",
    logField: "flattener",
    fields: [
      { key: "type", label: "Type", type: "select", options: ["Flattener", "Reducer/Flattener", "Coma Corrector", "Barlow"] },
      { key: "factor", label: "Factor", type: "text", placeholder: "0.8x" },
      { key: "backFocus", label: "Back Focus", type: "number", unit: "mm", placeholder: "55" },
    ],
  },
]

export function getCategory(id: CategoryId): CategoryDef {
  return CATEGORIES.find((c) => c.id === id)!
}

export interface EquipmentNote {
  id: string
  text: string
  createdAt: string
  updatedAt: string
}

export interface EquipmentStats {
  sessions: number
  integrationHours: number
  frames: number
  uniqueTargets: number
  lastUsed: string | null
  topTargets: { target: string; minutes: number }[]
  monthly: { month: string; hours: number }[]
}

/** Compute usage analytics for an equipment item from the imaging log. */
export function computeEquipmentStats(item: EquipmentItem, log: LogEntry[]): EquipmentStats {
  const category = getCategory(item.category)
  const field = category.logField
  const used = log.filter((e) => e.kind === "session" && e[field] === item.name)

  const targetMinutes = new Map<string, number>()
  const monthMinutes = new Map<string, number>()
  let frames = 0
  let lastUsed: string | null = null

  for (const e of used) {
    targetMinutes.set(e.target, (targetMinutes.get(e.target) ?? 0) + e.totalIntegration)
    const month = e.date.slice(0, 7)
    monthMinutes.set(month, (monthMinutes.get(month) ?? 0) + e.totalIntegration)
    frames += e.frameCount
    if (!lastUsed || e.date > lastUsed) lastUsed = e.date
  }

  const totalMinutes = [...targetMinutes.values()].reduce((a, b) => a + b, 0)

  const topTargets = [...targetMinutes.entries()]
    .map(([target, minutes]) => ({ target, minutes }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5)

  const monthly = [...monthMinutes.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, minutes]) => ({ month, hours: Math.round((minutes / 60) * 10) / 10 }))

  return {
    sessions: used.length,
    integrationHours: Math.round((totalMinutes / 60) * 10) / 10,
    frames,
    uniqueTargets: targetMinutes.size,
    lastUsed,
    topTargets,
    monthly,
  }
}

export const INITIAL_EQUIPMENT: EquipmentItem[] = [
  { id: "t1", category: "telescopes", name: "Esprit 100ED", brand: "Sky-Watcher", type: "Refractor", aperture: 100, focalLength: 550, focalRatio: "f/5.5" },
  { id: "t2", category: "telescopes", name: "EdgeHD 8", brand: "Celestron", type: "SCT", aperture: 203, focalLength: 2032, focalRatio: "f/10" },
  { id: "c1", category: "cameras", name: "ASI2600MM Pro", brand: "ZWO", type: "Monochrome", sensor: "Sony IMX571", resolution: "6248 x 4176", pixelSize: 3.76 },
  { id: "c2", category: "cameras", name: "ASI533MC Pro", brand: "ZWO", type: "Color (OSC)", sensor: "Sony IMX533", resolution: "3008 x 3008", pixelSize: 3.76 },
  { id: "m1", category: "mounts", name: "EQ6-R Pro", brand: "Sky-Watcher", type: "Equatorial (GEM)", payload: 20, connection: "USB" },
  { id: "f1", category: "filters", name: "Ha 3nm", brand: "Antlia", type: "Ha", size: "36mm", bandwidth: "3nm" },
  { id: "f2", category: "filters", name: "OIII 3nm", brand: "Antlia", type: "OIII", size: "36mm", bandwidth: "3nm" },
  { id: "fl1", category: "flatteners", name: "Esprit Flattener", brand: "Sky-Watcher", type: "Flattener", factor: "1.0x", backFocus: 55 },
]

export const INITIAL_NOTES: Record<string, EquipmentNote[]> = {
  t1: [
    {
      id: "n1",
      text: "Collimation checked and stars are pin-sharp across the field with the matching flattener at 55mm back focus.",
      createdAt: "2025-03-14T21:30:00Z",
      updatedAt: "2025-03-14T21:30:00Z",
    },
    {
      id: "n2",
      text: "Slight tilt noticed in the lower-left corner. Need to inspect the camera adapter spacing.",
      createdAt: "2025-08-02T19:05:00Z",
      updatedAt: "2025-09-21T22:10:00Z",
    },
  ],
  c1: [
    {
      id: "n3",
      text: "Best results at gain 100, offset 50. Cooling to -10°C keeps dark current negligible.",
      createdAt: "2025-04-01T18:45:00Z",
      updatedAt: "2025-04-01T18:45:00Z",
    },
  ],
}
