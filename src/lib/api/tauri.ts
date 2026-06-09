import { invoke } from "@tauri-apps/api/core"
import type { AppApi } from "@/lib/api/types"
import type { AppState } from "@/types/app-state"
import type { Camera, Filter, Flattener, Mount, Telescope } from "@/types/equipment"
import { UUID } from "crypto"

// talks to the rust backend through tauri commands
export const tauriApi: AppApi = {
  getAppState(): Promise<AppState> {
    return invoke<AppState>("get_app_state")
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
