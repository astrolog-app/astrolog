import type { AppApi } from "@/lib/api/types"
import { tauriApi } from "@/lib/api/tauri"
import { mockApi } from "@/lib/api/mock"

// decide whether to talk to the real tauri backend or the web mock
// driven by NEXT_PUBLIC_APP_ENV ("tauri" | "web"), with a runtime fallback
// that auto-detects the tauri runtime when the env is not set
function resolveApi(): AppApi {
  const env = process.env.NEXT_PUBLIC_APP_ENV

  if (env === "tauri") return tauriApi
  if (env === "web") return mockApi

  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    return tauriApi
  }
  return mockApi
}

export const api: AppApi = resolveApi()
export type { AppApi } from "@/lib/api/types"
