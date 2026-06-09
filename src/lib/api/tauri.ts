import { invoke } from "@tauri-apps/api/core"
import type { AppApi } from "@/lib/api/types"
import type { AppState } from "@/types/app-state"

// talks to the rust backend through tauri commands
export const tauriApi: AppApi = {
  getAppState(): Promise<AppState> {
    return invoke<AppState>("get_app_state")
  },
}
