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

export default function Log() {
  return (
    <Tab className={styles.page}>
      <Card>
        <CardHeader>
          <CardTitle>Astrophotography Log</CardTitle>
          <CardDescription>
            Add imaging sessions and view your astrophotography log.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="secondary">Add Imaging Session</Button>
        </CardContent>
      </Card>
      <div className={styles.content}>
        <Card className={styles.tableCard}>
          <CardHeader>
            <SessionTable />
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
    </Tab>
  );
}
