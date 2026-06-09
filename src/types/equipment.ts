// typescript mirror of the rust equipment models in src-tauri/src/models/equipment.rs
// keys are snake_case to match the serde json output (the rust structs use no rename)
// Uuid serializes to a string, HashMap<Uuid, T> to a Record<string, T>

export interface Telescope {
  id: string
  brand: string
  name: string
  focal_length: number
  aperture: number
}

export interface Camera {
  id: string
  brand: string
  name: string
  pixel_size: number
  pixel_x: number
  pixel_y: number
  is_monochrome: boolean
  is_dslr: boolean
}

export interface Mount {
  id: string
  brand: string
  name: string
}

export interface Filter {
  id: string
  brand: string
  name: string
  filter_type: string
}

export interface Flattener {
  id: string
  brand: string
  name: string
  factor: number
}

export interface EquipmentList {
  telescopes: Record<string, Telescope>
  cameras: Record<string, Camera>
  mounts: Record<string, Mount>
  filters: Record<string, Filter>
  flatteners: Record<string, Flattener>
}
