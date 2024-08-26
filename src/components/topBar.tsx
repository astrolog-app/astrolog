'use client';

import { useState } from 'react';
import styles from './topBar.module.scss';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { Preferences } from './modals/preferences/preferences';
import { invoke } from '@tauri-apps/api/tauri';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export function TopBar() {
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const togglePreferencesModal = () => {
    setIsPreferencesOpen(!isPreferencesOpen);
  };

  async function openBrowser(url: string) {
    await invoke("open_browser", { url: url })
  }

  return (
    <div className={styles.topBar}>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger className={styles.astrolog}>AstroLog</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              About AstroLog
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={togglePreferencesModal}>
              Preferences...
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Hide</MenubarItem>
            <MenubarItem>Exit</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Imaging Session</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Create New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Calibration</MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger>Create New</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Dark Frame</MenubarItem>
                <MenubarItem>Bias Frame</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Equipment</MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger>Create New</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Telescope</MenubarItem>
                <MenubarItem>Camera</MenubarItem>
                <MenubarItem>Mount</MenubarItem>
                <MenubarItem>Filter</MenubarItem>
                <MenubarItem>Flattener</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Help</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => openBrowser("https://www.cloudynights.com/")}>Community Forum</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Feedback</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <TabsList className={styles.tabList}>
        <TabsTrigger value="log">Log</TabsTrigger>
        <TabsTrigger value="gallery">Gallery</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      {isPreferencesOpen && <Preferences onClose={togglePreferencesModal} />}
    </div>
  );
}
