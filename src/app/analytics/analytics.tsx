import { Tab } from '@/components/ui/custom/tab';
import styles from './analytics.module.scss';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SessionsChart } from '@/components/charts/sessionsChart';

export function Analytics() {
  return (
    <Tab>
      <Card>
        <CardHeader></CardHeader>
        <CardContent className={styles.chart}>
          <SessionsChart />
        </CardContent>
      </Card>
    </Tab>
  );
}
