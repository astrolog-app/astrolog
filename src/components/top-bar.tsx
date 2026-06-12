"use client"

import { Telescope } from "lucide-react"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { WindowControls } from "@/components/window-controls"
import { useIsMacOS, useIsTauri } from "@/lib/platform"
import { cn } from "@/lib/utils"

export function TopBar() {
  // on macos the native traffic lights overlay the bar, so inset the content
  const isTauri = useIsTauri()
  const isMac = useIsMacOS()
  const macInset = isTauri && isMac

  return (
    // data-tauri-drag-region makes empty bar space drag the frameless window,
    // clicks on the menubar and caption buttons are unaffected
    <header
      data-tauri-drag-region
      className={cn(
        "flex h-11 w-full shrink-0 select-none items-center gap-2 border-b border-border bg-card px-3",
        macInset && "pl-20",
      )}
    >
      <Telescope className="size-5 text-primary" aria-hidden="true" />
      <Menubar className="h-8 border-0 bg-transparent p-0">
        <MenubarMenu>
          <MenubarTrigger className="px-2 py-1 text-sm">AstroLog</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New Session
            </MenubarItem>
            <MenubarItem>
              Open Project
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Preferences</MenubarItem>
            <MenubarSeparator />
            <MenubarItem variant="destructive">Quit</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="px-2 py-1 text-sm">Library</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Open Library Folder</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Find Missing Frames</MenubarItem>
            <MenubarItem>Find Untracked Files</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Verify File Integrity</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="px-2 py-1 text-sm">Equipment</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Add Telescope</MenubarItem>
            <MenubarItem>Add Camera</MenubarItem>
            <MenubarItem>Add Mount</MenubarItem>
            <MenubarItem>Add Filter</MenubarItem>
            <MenubarItem>Add Flattener</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="px-2 py-1 text-sm">Help</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Documentation</MenubarItem>
            <MenubarItem>Feedback</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>About AstroLog</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <WindowControls />
    </header>
  )
}
