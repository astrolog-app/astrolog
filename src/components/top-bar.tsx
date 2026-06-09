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

export function TopBar() {
  return (
    <header className="flex h-11 w-full shrink-0 items-center gap-2 border-b border-border bg-card px-3">
      <Telescope className="size-5 text-primary" aria-hidden="true" />
      <Menubar className="h-8 border-0 bg-transparent p-0">
        <MenubarMenu>
          <MenubarTrigger className="px-2 py-1 text-sm">AstroLog</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New Session <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Open Project <MenubarShortcut>⌘O</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Preferences</MenubarItem>
            <MenubarSeparator />
            <MenubarItem variant="destructive">Quit</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="px-2 py-1 text-sm">Imaging Frames</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Import Frames</MenubarItem>
            <MenubarItem>Light Frames</MenubarItem>
            <MenubarItem>Dark Frames</MenubarItem>
            <MenubarItem>Flat Frames</MenubarItem>
            <MenubarItem>Bias Frames</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Stack Selected</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="px-2 py-1 text-sm">Equipment</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Telescopes</MenubarItem>
            <MenubarItem>Cameras</MenubarItem>
            <MenubarItem>Mounts</MenubarItem>
            <MenubarItem>Filters</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Add Equipment</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="px-2 py-1 text-sm">Help</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Documentation</MenubarItem>
            <MenubarItem>Keyboard Shortcuts</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>About AstroLog</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </header>
  )
}
