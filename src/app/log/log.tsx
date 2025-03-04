'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tab } from '@/components/ui/custom/tab';
import styles from './log.module.scss';
import { LogTable } from '@/components/sessionTable/logTable';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import NewImagingSession from '@/components/modals/imagingSession/newImagingSession';
import { UUID } from 'crypto';
import { save } from '@tauri-apps/plugin-dialog';
import { toast } from '@/components/ui/use-toast';
import { invoke } from '@tauri-apps/api/core';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useModal } from '@/context/modalProvider';
import SelectImagingFrames from '@/components/modals/selectImagingFrames';
import ImagePreview from '@/components/images/imagePreview';
import HeaderCard from '@/components/headerCard';
import { Download, Plus } from 'lucide-react';

export default function Log() {
  const { openModal } = useModal();

  const [selectedSessionId, setSelectedSessionId] = useState<UUID | undefined>(
    undefined,
  );

  function exportCSV() {
    save({
      defaultPath: '', // TODO: define default path
      filters: [
        {
          name: '.csv',
          extensions: ['csv'],
        },
      ],
    })
      .then((selectedPath) => {
        if (selectedPath) {
          console.log(selectedPath);
          invoke('export_csv', { path: selectedPath });
        }
      })
      .catch((err) => {
        toast({
          variant: 'destructive',
          description: 'Failed to export CSV: ' + err,
        });
        console.log(err);
      });
  }

  return (
    <Tab className={styles.page}>
      <HeaderCard
        title="Astrophotography Log"
        subtitle="Add imaging sessions and view your astrophotography log."
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => openModal(<NewImagingSession />)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Session
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => openModal(<SelectImagingFrames />)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Calibration
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={exportCSV}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </HeaderCard>
      <ResizablePanelGroup className={styles.content} direction="horizontal">
        <ResizablePanel defaultSize={70}>
          <Card className={styles.tableCard}>
            <CardHeader className={styles.tableWrapper}>
              <LogTable setSelectedSessionId={setSelectedSessionId} />
            </CardHeader>
          </Card>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30}>
          <ImagePreview selectedSessionId={selectedSessionId} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </Tab>
  );
}
