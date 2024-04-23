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

export default function Log() {
  const data = [
    {
      date: '22.22.2222',
      target: 'NGC 7655',
      sub_length: 300,
      total_subs: 20,
      integrated_subs: 15,
      filter: 'string',
      gain: 800,
      offset: 0,
      camera_temp: 15,
      outside_temp: 7,
      average_seeing: 0.43,
      average_cloud_cover: 0.12,
      telescope: 'string',
      flattener: 'string',
      mount: 'string',
      camera: 'string',
      notes: 'string',
    },
  ];

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
