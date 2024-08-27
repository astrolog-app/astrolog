'use client'

import styles from './sideNav.module.scss';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SideNav() {
  return (
    <div className={styles.sideNav}>
      <TabsList>

      <TabsTrigger value="log">
      <div className={styles.test}>1</div>
      </TabsTrigger>
      <div className={styles.test}>2</div>
      <div className={styles.test}>3</div>
      </TabsList>
    </div>
  );
}
