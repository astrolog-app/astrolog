'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tab } from '@/components/ui/custom/tab';
import styles from './log.module.scss';
import { SessionTable } from '@/components/sessionTable/sessionTable';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import NewImagingSession from '@/components/modals/newImagingSession/newImagingSession';
import { UUID } from 'crypto';
import { save } from '@tauri-apps/api/dialog';
import { toast } from '@/components/ui/use-toast';
import { invoke } from '@tauri-apps/api/tauri';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

export default function Log() {
  const [isModalOpen, setisModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<UUID | undefined>(undefined);

  function toggleModal() {
    setisModalOpen(!isModalOpen);
    console.log(isModalOpen);
  }

  function exportCSV() {
    save({
      defaultPath: '', // TODO: define default path
      filters: [{
        name: '.csv',
        extensions: ['csv']
      }]
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
          description: 'Failed to export CSV: ' + err
        });
        console.log(err);
      });
  }

  return (
    <Tab className={styles.page}>
      <Card>
        <CardHeader>
          <CardTitle>Astrophotography Log</CardTitle>
          <CardDescription>
            Add imaging sessions and view your astrophotography log.
          </CardDescription>
        </CardHeader>
        <CardContent className={styles.buttons}>
          <Button variant="secondary" onClick={toggleModal}>
            Add Imaging Session
          </Button>
          <Button variant="ghost" onClick={exportCSV}>
            Export CSV
          </Button>
        </CardContent>
      </Card>
      <ResizablePanelGroup className={styles.content} direction="horizontal">
        <ResizablePanel defaultSize={70}>
          <Card className={styles.tableCard}>
            <CardHeader className={styles.tableWrapper}>
              <SessionTable setSelectedSessionId={setSelectedSessionId} />
            </CardHeader>
          </Card>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30}>
          <Card className={styles.imagePreviewCard}>
            <CardHeader>
              <CardTitle>Image Preview</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.imagePreview}></div>
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
      {isModalOpen && <NewImagingSession onClose={toggleModal} />}
    </Tab>
  );
}
