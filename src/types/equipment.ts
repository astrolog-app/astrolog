import { UUID } from 'crypto'

// typescript mirror of the rust equipment models in src-tauri/src/models/equipment.rs
// keys are snake_case to match the serde json output (the rust structs use no rename)
// Uuid serializes to a string, HashMap<Uuid, T> to a Record<UUID, T>

export interface Telescope {
  id: UUID
  brand: string
  name: string
  telescope_type: string
  focal_length: number
  aperture: number
}

export interface Camera {
  id: UUID
  brand: string
  name: string
  pixel_size: number
  pixel_x: number
  pixel_y: number
  sensor_type: string
}

export interface Mount {
  id: UUID
  brand: string
  name: string
}

export interface Filter {
  id: UUID
  brand: string
  name: string
  filter_type: string
  size: string
}

export interface Flattener {
  id: UUID
  brand: string
  name: string
  flattener_type: string
  factor: number
}

export interface EquipmentList {
  telescopes: Record<UUID, Telescope>
  cameras: Record<UUID, Camera>
  mounts: Record<UUID, Mount>
  filters: Record<UUID, Filter>
  flatteners: Record<UUID, Flattener>
}
