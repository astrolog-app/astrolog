import { invoke } from "@tauri-apps/api/core"
import type { AppApi } from "@/lib/api/types"
import type { AppState } from "@/types/app-state"
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

// talks to the rust backend through tauri commands
export const tauriApi: AppApi = {
  getAppState(): Promise<AppState> {
    return invoke<AppState>("get_app_state")
  },

  getBiasFrames(query: BiasFrameQuery): Promise<BiasFramePage> {
    return invoke<BiasFramePage>("get_bias_frames", { query })
  },
  getDarkFrames(query: DarkFrameQuery): Promise<DarkFramePage> {
    return invoke<DarkFramePage>("get_dark_frames", { query })
  },
  getDarkFlatFrames(query: DarkFlatFrameQuery): Promise<DarkFlatFramePage> {
    return invoke<DarkFlatFramePage>("get_dark_flat_frames", { query })
  },
  getFlatFrames(query: FlatFrameQuery): Promise<FlatFramePage> {
    return invoke<FlatFramePage>("get_flat_frames", { query })
  },
  getLightFrames(query: LightFrameQuery): Promise<LightFramePage> {
    return invoke<LightFramePage>("get_light_frames", { query })
  },

  saveTelescope(telescope: Telescope): Promise<void> {
    return invoke("save_telescope", { telescope })
  },
  deleteTelescope(id: UUID): Promise<void> {
    return invoke("delete_telescope", { id })
  },

  saveCamera(camera: Camera): Promise<void> {
    return invoke("save_camera", { camera })
  },
  deleteCamera(id: UUID): Promise<void> {
    return invoke("delete_camera", { id })
  },

  saveMount(mount: Mount): Promise<void> {
    return invoke("save_mount", { mount })
  },
  deleteMount(id: UUID): Promise<void> {
    return invoke("delete_mount", { id })
  },

  saveFilter(filter: Filter): Promise<void> {
    return invoke("save_filter", { filter })
  },
  deleteFilter(id: UUID): Promise<void> {
    return invoke("delete_filter", { id })
  },

  saveFlattener(flattener: Flattener): Promise<void> {
    return invoke("save_flattener", { flattener })
  },
  deleteFlattener(id: UUID): Promise<void> {
    return invoke("delete_flattener", { id })
  },
}
