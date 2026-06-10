import { UUID } from "crypto"

// mirrors the rust models in src-tauri/src/models/imaging_frames (snake_case)

// one physical bias frame on disk
export interface BiasFrame {
  id: UUID
  hash: string | null
  rel_path: string
  camera_id: UUID
  captured_at: string
  gain: number
  binning: number
  offset: number | null
}

// one aggregated table row: bias frames sharing camera + settings + night
export interface BiasFrameRow {
  camera_id: UUID
  gain: number
  binning: number
  offset: number | null
  // noon-to-noon night, "YYYY-MM-DD"
  night: string
  total_frames: number
  first_captured: string
  last_captured: string
}

export type BiasFrameSortKey =
  | "night"
  | "total_frames"
  | "gain"
  | "binning"
  | "first_captured"
  | "last_captured"

export type SortDir = "asc" | "desc"

export interface BiasFrameQuery {
  // optional regex applied across the row's visible columns
  search: string | null
  sort_by: BiasFrameSortKey
  sort_dir: SortDir
  limit: number
  offset: number
}

export interface BiasFramePage {
  rows: BiasFrameRow[]
  total: number
}

// ------------ dark frames ------------

// one physical dark frame on disk
export interface DarkFrame {
  id: UUID
  hash: string | null
  rel_path: string
  camera_id: UUID
  captured_at: string
  gain: number
  binning: number
  offset: number | null
  exposure: number
  sensor_temp: number | null
}

// dark frames sharing camera + settings + exposure + temp + night
export interface DarkFrameRow {
  camera_id: UUID
  gain: number
  binning: number
  offset: number | null
  exposure: number
  sensor_temp: number | null
  night: string
  total_frames: number
  first_captured: string
  last_captured: string
}

export type DarkFrameSortKey =
  | "night"
  | "total_frames"
  | "gain"
  | "binning"
  | "exposure"
  | "first_captured"
  | "last_captured"

export interface DarkFrameQuery {
  search: string | null
  sort_by: DarkFrameSortKey
  sort_dir: SortDir
  limit: number
  offset: number
}

export interface DarkFramePage {
  rows: DarkFrameRow[]
  total: number
}

// ------------ dark flat frames ------------

// one physical dark-flat frame on disk
export interface DarkFlatFrame {
  id: UUID
  hash: string | null
  rel_path: string
  camera_id: UUID
  captured_at: string
  gain: number
  binning: number
  offset: number | null
  exposure: number
}

// dark-flat frames sharing camera + settings + exposure + night
export interface DarkFlatFrameRow {
  camera_id: UUID
  gain: number
  binning: number
  offset: number | null
  exposure: number
  night: string
  total_frames: number
  first_captured: string
  last_captured: string
}

export type DarkFlatFrameSortKey =
  | "night"
  | "total_frames"
  | "gain"
  | "binning"
  | "exposure"
  | "first_captured"
  | "last_captured"

export interface DarkFlatFrameQuery {
  search: string | null
  sort_by: DarkFlatFrameSortKey
  sort_dir: SortDir
  limit: number
  offset: number
}

export interface DarkFlatFramePage {
  rows: DarkFlatFrameRow[]
  total: number
}

// ------------ flat frames ------------

// one physical flat frame on disk
export interface FlatFrame {
  id: UUID
  hash: string | null
  rel_path: string
  camera_id: UUID
  telescope_id: UUID | null
  filter_id: UUID | null
  captured_at: string
  gain: number
  binning: number
  offset: number | null
  exposure: number
}

// flat frames sharing optics + settings + exposure + night
export interface FlatFrameRow {
  camera_id: UUID
  telescope_id: UUID | null
  filter_id: UUID | null
  gain: number
  binning: number
  offset: number | null
  exposure: number
  night: string
  total_frames: number
  first_captured: string
  last_captured: string
}

export type FlatFrameSortKey =
  | "night"
  | "total_frames"
  | "gain"
  | "binning"
  | "exposure"
  | "first_captured"
  | "last_captured"

export interface FlatFrameQuery {
  search: string | null
  sort_by: FlatFrameSortKey
  sort_dir: SortDir
  limit: number
  offset: number
}

export interface FlatFramePage {
  rows: FlatFrameRow[]
  total: number
}

// ------------ light frames ------------

// one physical light frame on disk
export interface LightFrame {
  id: UUID
  hash: string | null
  rel_path: string
  camera_id: UUID
  telescope_id: UUID | null
  filter_id: UUID | null
  captured_at: string
  target: string
  gain: number
  binning: number
  offset: number | null
  exposure: number
  sensor_temp: number | null
}

// light frames sharing target + optics + settings + exposure + temp + night
export interface LightFrameRow {
  camera_id: UUID
  telescope_id: UUID | null
  filter_id: UUID | null
  target: string
  gain: number
  binning: number
  offset: number | null
  exposure: number
  sensor_temp: number | null
  night: string
  total_frames: number
  first_captured: string
  last_captured: string
}

export type LightFrameSortKey =
  | "night"
  | "target"
  | "total_frames"
  | "gain"
  | "binning"
  | "exposure"
  | "first_captured"
  | "last_captured"

export interface LightFrameQuery {
  search: string | null
  sort_by: LightFrameSortKey
  sort_dir: SortDir
  limit: number
  offset: number
}

export interface LightFramePage {
  rows: LightFrameRow[]
  total: number
}
