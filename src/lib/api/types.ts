import type { AppState, Unit } from "@/types/app-state"
import type { Camera, Filter, Flattener, Mount, Telescope } from "@/types/equipment"
import type {
  BiasFramePage,
  BiasFrameQuery,
  DarkFlatFramePage,
  DarkFlatFrameQuery,
  DarkFramePage,
  DarkFrameQuery,
  FlatFramePage,
  FlatFrameQuery,
  LightFramePage,
  LightFrameQuery,
} from "@/types/imaging-frames"
import { UUID } from "crypto"

// the surface the frontend uses to talk to the backend
// implemented by the real tauri bridge and by a web mock
export interface AppApi {
  getAppState(): Promise<AppState>

  // first-run setup: native folder pickers (null when cancelled; the library
  // picker rejects folders that are neither empty nor an existing library)
  // and the finish step that persists the library choice and restarts the app
  pickFolder(): Promise<string | null>
  pickLibraryFolder(): Promise<string | null>
  finishSetup(rootDirectory: string, unit: Unit): Promise<void>

  // grouped frame rows, each with regex search, sort and pagination
  getBiasFrames(query: BiasFrameQuery): Promise<BiasFramePage>
  getDarkFrames(query: DarkFrameQuery): Promise<DarkFramePage>
  getDarkFlatFrames(query: DarkFlatFrameQuery): Promise<DarkFlatFramePage>
  getFlatFrames(query: FlatFrameQuery): Promise<FlatFramePage>
  getLightFrames(query: LightFrameQuery): Promise<LightFramePage>

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
