'use client'

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
import { columns } from '@/components/sessionTable/columns';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri'

export default function Log() {
  const [data, setData] : any = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const responseData = await invoke('get_log_data');
        setData(responseData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  return (
    <Tab className={styles.page}>
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
      </Card>
      <div className={styles.content}>
        <SessionTable columns={columns} data={data} />
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
    </Tab>
  );
}
