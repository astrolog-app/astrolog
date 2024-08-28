'use client'

import styles from './sideNav.module.scss';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import React from 'react';

interface SideNavProps {
  tabs: React.ReactNode[];
  selectedTab: React.ReactNode;
  setSelectedTab: React.Dispatch<React.SetStateAction<React.ReactNode>>;
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
