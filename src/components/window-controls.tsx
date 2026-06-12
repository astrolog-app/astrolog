"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useIsMacOS, useIsTauri } from "@/lib/platform"

// caption buttons (minimize / maximize / close) for the frameless window on
// windows and linux; macos keeps its native traffic lights and the browser/v0
// has no window to control, so the component renders nothing there
export function WindowControls() {
  const isTauri = useIsTauri()
  const isMac = useIsMacOS()
  const visible = isTauri && !isMac
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    if (!visible) return

    // keep the maximize/restore glyph in sync even when the state changes
    // outside the button (double-click on the drag region, win+arrow snap)
    let unlisten: (() => void) | undefined
    let disposed = false
    const refresh = () => {
      api.isWindowMaximized().then(setMaximized).catch(() => {})
    }
    refresh()
    api.onWindowResized(refresh).then((fn) => {
      if (disposed) fn()
      else unlisten = fn
    })

    return () => {
      disposed = true
      unlisten?.()
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className="ml-auto -mr-3 flex self-stretch">
      <button
        type="button"
        aria-label="Minimize window"
        onClick={() => api.minimizeWindow()}
        className="inline-flex w-12 items-center justify-center text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>
      <button
        type="button"
        aria-label={maximized ? "Restore window" : "Maximize window"}
        onClick={() => api.toggleMaximizeWindow()}
        className="inline-flex w-12 items-center justify-center text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
      >
        {maximized ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <rect x="0.5" y="2.5" width="7" height="7" stroke="currentColor" strokeWidth="1" />
            <path d="M2.5 2.5V0.5H9.5V7.5H7.5" stroke="currentColor" strokeWidth="1" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" strokeWidth="1" />
          </svg>
        )}
      </button>
      <button
        type="button"
        aria-label="Close window"
        onClick={() => api.closeWindow()}
        className="inline-flex w-12 items-center justify-center text-foreground/80 transition-colors hover:bg-red-600 hover:text-white"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <line x1="0.5" y1="0.5" x2="9.5" y2="9.5" stroke="currentColor" strokeWidth="1" />
          <line x1="9.5" y1="0.5" x2="0.5" y2="9.5" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>
    </div>
  )
}
