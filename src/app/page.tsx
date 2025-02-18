'use client';

import styles from './page.module.scss';
import { Analytics } from './analytics/analytics';
import Log from './log/log';
import Gallery from './gallery/gallery';
import { TopBar } from '@/components/bars/topBar';
import SideNav from '@/components/bars/sideNav';
import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AnalyticsSVG, EquipmentSVG, GallerySVG, LogSVG } from '@/public/svgs';
import Equipment from '@/app/equipment/equipment';
import License from '@/components/modals/license';
import { KeygenLicense } from 'tauri-plugin-keygen-api';
import { toast } from '@/components/ui/use-toast';
import { useModal } from '@/context/modalProvider';
import { useAppState } from '@/context/stateProvider';
import BottomBar from '@/components/bars/bottomBar';

export interface Tab {
  component: React.ReactNode;
  key: string;
  tooltip: string;
  icon: React.ReactNode;
}

export default function Home() {
  const tabs: Tab[] = [
    {
      component: <Log />,
      key: 'log',
      tooltip: 'Astrophotography Log',
      icon: <LogSVG />,
    },
    {
      component: <Equipment />,
      key: 'equipment',
      tooltip: 'Equipment',
      icon: <EquipmentSVG />,
    },
    {
      component: <Gallery />,
      key: 'gallery',
      tooltip: 'Gallery',
      icon: <GallerySVG />,
    },
    {
      component: <Analytics />,
      key: 'analytics',
      tooltip: 'Analytics',
      icon: <AnalyticsSVG />,
    },
  ];
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const { openModal } = useModal();
  const { appState } = useAppState();

  const checkLicense = useCallback(async () => {
    const { validateKey, getLicenseKey, getLicense } = await import(
      'tauri-plugin-keygen-api'
    );

    const licenseKey: string | null = await getLicenseKey();

    if (licenseKey === null) {
      openModal(<License />);
    } else {
      const license: KeygenLicense | null = await getLicense();

      if (license === null) {
        validateKey({ key: licenseKey }).then((newLicense) => {
          if (!newLicense.valid) {
            toast({
              variant: 'destructive',
              title: 'Uh oh! Something went wrong.',
              description: 'Error: ',
            });
            openModal(<License />);
          }
        });
      } else {
        if (!license.valid) {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: 'Error: ',
          });
          openModal(<License />);
        }
      }
    }
  }, []);

  useEffect(() => {
    // checkLicense();
    if (appState.preferences.storage.root_directory == '') {
      //openModal(<RootDirectory />);
    }
  }, []);

  return (
    <div className={styles.tabs}>
      <TopBar />
      <div className={styles.bottom}>
        <SideNav
          tabs={tabs}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
        <AnimatePresence mode="wait">
          <motion.div
            className={styles.content}
            key={selectedTab.key}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {selectedTab.component}
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomBar />
    </div>
  );
}
