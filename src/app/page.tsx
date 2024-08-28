'use client'

import styles from './page.module.scss';
import { Analytics } from './analytics/analytics';
import Log from './log/log';
import Gallery from './gallery/gallery';
import { TopBar } from '@/components/topBar';
import SideNav from '@/components/sideNav';
import React, { useState } from 'react';

export default function Home() {
  const tabs = [
    <Log key="log" />,
    <Gallery key="gallery" />,
    <Analytics key="analytics" />
  ]
  const [selectedTab, setSelectedTab] = useState<React.ReactNode>(tabs[0]);

  return (
    <div className={styles.tabs}>
      <TopBar />
      <div className={styles.bottom}>
        <SideNav tabs={tabs} selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
        <div className={styles.content}>
          {selectedTab}
        </div>
      </div>
    </div>
  );
}
