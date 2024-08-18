import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tab } from '@/components/ui/custom/tab';
import styles from './gallery.module.scss';
import ImageView from '@/components/imageView';

export default function Gallery() {
  return (
    <Tab>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>Gallery</CardTitle>
          <CardDescription>
            View your processed astrophotos.
          </CardDescription>
        </CardHeader>
      </Card>
      <ImageView className={styles.imageView} />
    </Tab>
  );
}
