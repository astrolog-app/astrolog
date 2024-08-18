import { Tab } from '@/components/ui/custom/tab';
import styles from './analytics.module.scss';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import SessionsChart from '@/components/statistics/sessionsChart';
import { EquipmentChart } from '@/components/statistics/equipmentChart';
import { IntegrationChart } from '@/components/statistics/integrationChart';
import InfoCard from '@/components/statistics/infoCard';

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
      <div className={styles.lower}>
        <SessionsChart className={styles.sessionsChart} />
        <div className={styles.chartGroup}>
          <InfoCard className={styles.infoCard} />
          <InfoCard className={styles.infoCard} />
          <InfoCard className={styles.infoCard} />
        </div>
        <div className={styles.chartGroup}>
          <EquipmentChart className={styles.equipmentChart} />
          <IntegrationChart className={styles.integrationChart} />
        </div>
        <div className={styles.chartGroup}>
          <InfoCard className={styles.infoCard} />
          <InfoCard className={styles.infoCard} />
          <InfoCard className={styles.infoCard} />
          <InfoCard className={styles.infoCard} />
        </div>
      </div>
    </Tab>
  );
}
