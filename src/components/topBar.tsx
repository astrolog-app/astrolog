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
  MenubarTrigger
} from '@/components/ui/menubar';
import { Preferences } from './modals/preferences/preferences';
import { invoke } from '@tauri-apps/api/tauri';

export function TopBar() {
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const togglePreferencesModal = () => {
    setIsPreferencesOpen(!isPreferencesOpen);
  };

  async function openBrowser(url: string) {
    await invoke('open_browser', { url: url });
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
          <MenubarTrigger>Imaging Frames</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New Imaging Session...</MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>Calibration</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>New Dark Frame...</MenubarItem>
                <MenubarItem>New Bias Frame...</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Gallery</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New Image...</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Help</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => openBrowser('https://www.cloudynights.com/')}>Community Forum</MenubarItem>
            <MenubarItem onClick={() => openBrowser('https://docs.astro-log.app/')}>Documentation</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Feedback</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      {isPreferencesOpen && <Preferences onClose={togglePreferencesModal} />}
    </div>
  );
}
