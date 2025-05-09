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
import { Preferences } from '../modals/preferences/preferences';
import { invoke } from '@tauri-apps/api/core';
import { toast } from '@/components/ui/use-toast';
import { useModal } from '@/context/modalProvider';
import NewImagingSession, { newImagingSession } from '@/components/modals/imagingSession/newImagingSession';
import { newCalibrationFrameSession } from '@/components/modals/calibrationRowEditor';
import SelectImagingFrames from '@/components/modals/selectImagingFrames';
import { useAppState } from '@/context/stateProvider';
import EquipmentModal from '@/components/modals/equipment/equipment';
import { EquipmentType } from '@/enums/equipmentType';

export function TopBar() {
  const { openModal } = useModal();
  const { appState } = useAppState();

  function openBrowser(url: string): void {
    invoke('open_browser', { url: url }).catch((error) => {
      const errorMsg = error as string;
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Error: ' + errorMsg,
      });
    });
  }

  async function minimize() {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');

    await getCurrentWindow().minimize();
  }

  async function close() {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');

    await getCurrentWindow().close();
  }

  return (
    <div className={styles.topBar}>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger className={styles.astrolog}>AstroLog</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => openBrowser('https://astro-log.app/about/')}>About AstroLog</MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => openModal(<Preferences />)}>
              Preferences...
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => minimize()}>Hide</MenubarItem>
            <MenubarItem onClick={() => close()}>Exit</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Imaging Frames</MenubarTrigger>
          <MenubarContent>
            <MenubarItem
              onClick={() => newImagingSession({
                appState,
                open: () => openModal(<NewImagingSession />),
                openModal: openModal
              })}
            >
              New Imaging Session...
            </MenubarItem>
            <MenubarItem
              onClick={() => newCalibrationFrameSession({
                appState,
                open: () => openModal(<SelectImagingFrames />),
                openModal: openModal
              })}
            >
              New Calibration Frame...
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Equipment</MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger>New Equipment Item</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => openModal(<EquipmentModal type={EquipmentType.TELESCOPE} />)}>New Telescope...</MenubarItem>
                <MenubarItem onClick={() => openModal(<EquipmentModal type={EquipmentType.CAMERA} />)}>New Camera...</MenubarItem>
                <MenubarItem onClick={() => openModal(<EquipmentModal type={EquipmentType.MOUNT} />)}>New Mount...</MenubarItem>
                <MenubarItem onClick={() => openModal(<EquipmentModal type={EquipmentType.FILTER} />)}>New Filter...</MenubarItem>
                <MenubarItem onClick={() => openModal(<EquipmentModal type={EquipmentType.FLATTENER} />)}>New Flattener...</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
        {/*<MenubarMenu>
          <MenubarTrigger>Gallery</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New Image...</MenubarItem>
          </MenubarContent>
        </MenubarMenu>*/}
        <MenubarMenu>
          <MenubarTrigger>Help</MenubarTrigger>
          <MenubarContent>
            <MenubarItem
              onClick={() => openBrowser('https://www.cloudynights.com/')}
            >
              Community Forum
            </MenubarItem>
            <MenubarItem
              onClick={() => openBrowser('https://docs.astro-log.app/')}
            >
              Documentation
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Feedback</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
}
