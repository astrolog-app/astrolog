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
