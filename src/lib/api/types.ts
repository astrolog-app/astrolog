import type { AppState } from "@/types/app-state"
import type { Camera, Filter, Flattener, Mount, Telescope } from "@/types/equipment"
import type { BiasFramePage, BiasFrameQuery } from "@/types/imaging-frames"
import { UUID } from "crypto"

// the surface the frontend uses to talk to the backend
// implemented by the real tauri bridge and by a web mock
export interface AppApi {
  getAppState(): Promise<AppState>

  // grouped bias-frame rows, with regex search, sort and pagination
  getBiasFrames(query: BiasFrameQuery): Promise<BiasFramePage>

  // save_* upsert (add or edit), delete_* remove by id
  saveTelescope(telescope: Telescope): Promise<void>
  deleteTelescope(id: UUID): Promise<void>

  saveCamera(camera: Camera): Promise<void>
  deleteCamera(id: UUID): Promise<void>

  saveMount(mount: Mount): Promise<void>
  deleteMount(id: UUID): Promise<void>

  saveFilter(filter: Filter): Promise<void>
  deleteFilter(id: UUID): Promise<void>

  saveFlattener(flattener: Flattener): Promise<void>
  deleteFlattener(id: UUID): Promise<void>
}
