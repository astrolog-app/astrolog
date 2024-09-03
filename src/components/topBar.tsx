'use client';

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
import { toast } from '@/components/ui/use-toast';
import { useModal } from '@/context/modalProvider';
import NewImagingSession from '@/components/modals/newImagingSession/newImagingSession';

export function TopBar() {
  const { openModal } = useModal();

  async function openBrowser(url: string) {
    try {
      await invoke('open_browser', { url: url });
    } catch (error) {
      const errorMsg = error as string;
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Error: ' + errorMsg
      });
    }
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
            <MenubarItem onClick={() => openModal(<Preferences />)}>
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
            <MenubarItem onClick={() => openModal(<NewImagingSession />)}>New Imaging Session...</MenubarItem>
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
    </div>
  );
}
