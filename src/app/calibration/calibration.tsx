import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tab } from '@/components/ui/custom/tab';
import styles from './calibration.module.scss';

export default function Calibration() {
  return (
    <Tab>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>Calibration</CardTitle>
          <CardDescription>
            Manage the calibration frames for your astrophotos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
      </Card>
    </Tab>
  );
}
