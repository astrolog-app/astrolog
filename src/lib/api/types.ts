import type { AppState } from "@/types/app-state"

// the surface the frontend uses to talk to the backend
// implemented by the real tauri bridge and by a web mock
export interface AppApi {
  getAppState(): Promise<AppState>
}
