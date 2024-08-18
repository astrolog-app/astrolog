import { Tab } from '@/components/ui/custom/tab';
import styles from './analytics.module.scss';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import SessionsChart from '@/components/charts/sessionsChart';
import { EquipmentChart } from '@/components/charts/equipmentChart';
import { IntegrationChart } from '@/components/charts/integrationChart';

export function Analytics() {
  return (
    <Tab>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>
            View the analytics of your imaging sessions.
          </CardDescription>
        </CardHeader>
      </Card>
      <div>
        <SessionsChart className={styles.sessionsChart} />
        <div className={styles.middleCharts}>
          <EquipmentChart className={styles.equipmentChart} />
          <IntegrationChart className={styles.integrationChart} />
        </div>
      </div>
    </Tab>
  );
}
