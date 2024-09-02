'use client';

import styles from './page.module.scss';
import { Analytics } from './analytics/analytics';
import Log from './log/log';
import Gallery from './gallery/gallery';
import { TopBar } from '@/components/topBar';
import SideNav from '@/components/sideNav';
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AnalyticsSVG, GallerySVG, LogSVG } from '@/app/svgs';

export interface Tab {
  component: React.ReactNode;
  key: string;
  tooltip: string;
  icon: JSX.Element;
}

export default function Home() {
  const tabs: Tab[] = [
    { component: <Log />, key: 'log', tooltip: 'Astrophotography Log', icon: LogSVG },
    { component: <Gallery />, key: 'gallery', tooltip: 'Gallery', icon: GallerySVG },
    { component: <Analytics />, key: 'analytics', tooltip: 'Analytics', icon: AnalyticsSVG }
  ];
  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  return (
    <div className={styles.tabs}>
      <TopBar />
      <div className={styles.bottom}>
        <SideNav tabs={tabs} selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
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
    </div>
  );
}
