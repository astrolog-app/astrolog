import { useSyncExternalStore } from "react"

// runtime platform checks for window-chrome decisions (custom caption
// buttons on windows/linux vs the native traffic-light overlay on macos)

export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}

export function isMacOS(): boolean {
  return typeof navigator !== "undefined" && navigator.userAgent.includes("Mac")
}

// the values never change during a session, so there is nothing to subscribe to
const emptySubscribe = () => () => {}
const serverSnapshot = () => false

// hydration-safe variants for rendering: false during prerender/hydration
// (matching the static export markup), the real value after mount
export function useIsTauri(): boolean {
  return useSyncExternalStore(emptySubscribe, isTauri, serverSnapshot)
}

export function useIsMacOS(): boolean {
  return useSyncExternalStore(emptySubscribe, isMacOS, serverSnapshot)
}
