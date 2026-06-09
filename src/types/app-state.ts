import type { EquipmentList } from "@/types/equipment"

// mirrors the rust preferences/state structs (snake_case to match serde output)

export type Unit = "METRIC" | "IMPERIAL"

export interface LocalConfig {
  schema_version: number
  root_directory: string
  source_directory: string
  unit: Unit
}

export interface FolderPaths {
  imaging_session_pattern: string
  dark_frame_pattern: string
  bias_frame_pattern: string
}

export interface Config {
  schema_version: number
  folder_paths: FolderPaths
}

// matches AppStateDto in src-tauri/src/commands.rs
export interface AppState {
  local_config: LocalConfig
  config: Config
  equipment: EquipmentList
}
