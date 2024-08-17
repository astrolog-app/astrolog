import styles from './page.module.scss';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Analytics } from './analytics/analytics';
import Log from './log/log';
import Calibration from './calibration/calibration';

export default function Home() {
  return (
    <Tabs defaultValue="log" className={styles.tabs}>
      <TabsList className={styles.tabList}>
        <TabsTrigger value="log">Log</TabsTrigger>
        <TabsTrigger value="calibration">Gallery</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      <TabsContent value="log" className={styles.tabsContent}>
        <Log />
      </TabsContent>
      <TabsContent value="calibration">
        <Calibration />
      </TabsContent>
      <TabsContent value="analytics">
        <Analytics />
      </TabsContent>
    </Tabs>
  );
}
