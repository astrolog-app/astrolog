"use client"

import { Activity, useState } from "react"
import { TopBar } from "@/components/top-bar"
import { SideNav, type ViewId } from "@/components/side-nav"
import { StatusBar } from "@/components/status-bar"
import { EquipmentView } from "@/components/equipment/equipment-view"
import { LogView } from "@/components/log/log-view"
import { AnalyticsView } from "@/components/analytics/analytics-view"

export default function Home() {
  const [view, setView] = useState<ViewId>("log")

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-sans">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <SideNav active={view} onChange={setView} />
        <main className="min-w-0 flex-1 overflow-hidden p-4">
          {/* All views stay mounted so their state (tabs, selection, panel sizes) is preserved across switches. */}
          <Activity mode={view === "log" ? "visible" : "hidden"}>
            <LogView />
          </Activity>
          <Activity mode={view === "equipment" ? "visible" : "hidden"}>
            <EquipmentView />
          </Activity>
          <Activity mode={view === "analytics" ? "visible" : "hidden"}>
            <AnalyticsView />
          </Activity>
        </main>
      </div>
      <StatusBar />
    </div>
  )
}
