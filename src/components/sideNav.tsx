'use client'

import styles from './sideNav.module.scss';
import React from 'react';
import { Tab } from '@/app/page';

interface SideNavProps {
  tabs: Tab[];
  selectedTab: Tab;
  setSelectedTab: React.Dispatch<React.SetStateAction<Tab>>;
}

export default function SideNav({ tabs, selectedTab, setSelectedTab }: SideNavProps) {
  return (
    <div className={styles.sideNav}>
      <div className={styles.test} onClick={() => setSelectedTab(tabs[0])}>1</div>
      <div className={styles.test} onClick={() => setSelectedTab(tabs[1])}>2</div>
      <div className={styles.test} onClick={() => setSelectedTab(tabs[2])}>3</div>
    </div>
  );
}
