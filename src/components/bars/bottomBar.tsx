'use client';

import styles from './bottomBar.module.scss';
import { useEffect, useState } from 'react';
import { getVersion } from '@tauri-apps/api/app';
import { Progress } from '@/components/ui/progress';
import { useProcess } from '@/context/processProvider';
import { Process } from '@/interfaces/process';
import { UUID } from 'crypto';

export default function BottomBar() {
  const { processes } = useProcess();

  const [version, setVersion] = useState('Loading...');
  const [currentProcess, setCurrentProcess] = useState<Process | undefined>(
    undefined,
  );
  const [currentProcessId, setCurrentProcessId] = useState<UUID | undefined>(
    undefined,
  );
  const [progress, setProgress] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (currentProcessId === undefined) {
      if (processes.size > 0) {
        const newProcess: Process = processes.values().next().value;

        setCurrentProcess(processes.values().next().value);
        setCurrentProcessId(newProcess.id);
      }
    } else {
      if (processes.has(currentProcessId)) {
        setCurrentProcess(processes.get(currentProcessId));
      } else {
        setProgress(0);
        setCurrentProcessId(undefined);
        setCurrentProcess(undefined);
      }
    }
  }, [currentProcessId, processes]);

  useEffect(() => {
    if (currentProcess?.step != undefined && currentProcess?.max != undefined) {
      setProgress((100 * currentProcess?.step) / currentProcess?.max);
    }
  }, [currentProcess]);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const appVersion = await getVersion();
        setVersion(appVersion);
      } catch (error) {
        console.error('Error fetching app version:', error);
        setVersion('Error retrieving version');
      }
    };

    void fetchVersion();
  }, []);

  return (
    <div className={styles.component}>
      <div className={styles.left}>AstroLog v{version} ©Rouven Spaar</div>
      {processes.size != 0 && (
        <div className={styles.right}>
          <div>{currentProcess?.name}...</div>
          {processes.size > 1 && <div>&nbsp; (+{processes.size - 1} more)</div>}
          {progress != undefined && (
            <>
              <Progress value={progress} className={styles.progressBar} />
              <div>
                ({currentProcess?.step}/{currentProcess?.max})
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
