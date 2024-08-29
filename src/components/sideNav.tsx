'use client';

import styles from './sideNav.module.scss';
import React from 'react';
import { Tab } from '@/app/page';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SideNavProps {
  tabs: Tab[];
  selectedTab: Tab;
  setSelectedTab: React.Dispatch<React.SetStateAction<Tab>>;
}

export default function SideNav({ tabs, selectedTab, setSelectedTab }: SideNavProps) {
  return (
    <div className={styles.sideNav}>
      <TooltipProvider>
        {tabs.map((tab, index) => (
          <Tooltip
            key={tab.key}
          >
            <TooltipTrigger
              className={cn(styles.tabWrapper, selectedTab.key === tab.key ? styles.selectedWrapper : '')}
            >
              <div
                className={cn(styles.tab, selectedTab.key === tab.key ? styles.selected : '')}
                onClick={() => setSelectedTab(tab)}
              >
                {tab.icon}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              {tab.tooltip}
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
