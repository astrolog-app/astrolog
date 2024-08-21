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
import { SessionTable } from '@/components/sessionTable/sessionTable';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import NewImagingSession from '@/components/modals/newImagingSession/newImagingSession';
import { UUID } from 'crypto';

export default function Log() {
  const [isModalOpen, setisModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<UUID | undefined>(undefined);

  function toggleModal() {
    setisModalOpen(!isModalOpen);
    console.log(isModalOpen);
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
          <Button variant='ghost' onClick={toggleModal}>
            Export CSV
          </Button>
        </CardContent>
      </Card>
      <div className={styles.content}>
        <Card className={styles.tableCard}>
          <CardHeader className={styles.tableWrapper}>
            <SessionTable setSelectedSessionId={setSelectedSessionId} />
          </CardHeader>
        </Card>
        <Card className={styles.imagePreviewCard}>
          <CardHeader>
            <CardTitle>Image Preview</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.imagePreview}></div>
          </CardContent>
        </Card>
      </div>
      {isModalOpen && <NewImagingSession onClose={toggleModal} />}
    </Tab>
  );
}
