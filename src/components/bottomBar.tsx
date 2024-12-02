"use client";

import styles from './bottomBar.module.scss';
import { useEffect, useState } from 'react';
import { getVersion } from '@tauri-apps/api/app';
import { Progress } from '@/components/ui/progress';

export default function BottomBar() {
  const [version, setVersion] = useState("Loading...");

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const appVersion = await getVersion();
        setVersion(appVersion);
      } catch (error) {
        console.error("Error fetching app version:", error);
        setVersion("Error retrieving version");
      }
    };

    void fetchVersion();
  }, []);

  return (
    <div className={styles.component}>
      <div className={styles.left}>AstroLog v{version} ©Rouven Spaar</div>
      <div className={styles.right}>
        <div>Classifying Imaging Session...</div>
        <Progress value={64} className={styles.progressBar} />
        <div>(32/49)</div>
      </div>
    </div>
  );
}
