import styles from './page.module.scss';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Analytics } from './analytics/analytics';
import Log from './log/log';
import Gallery from './gallery/gallery';
import { TopBar } from '@/components/topBar';

export default function Home() {
  return (
    <Tabs defaultValue="log" className={styles.tabs}>
      <TopBar />
      <div className={styles.content}>
        <TabsContent value="log" className={styles.tabsContent}>
          <Log />
        </TabsContent>
        <TabsContent value="gallery">
          <Gallery />
        </TabsContent>
        <TabsContent value="analytics">
          <Analytics />
        </TabsContent>
      </div>
    </Tabs>
  );
}
