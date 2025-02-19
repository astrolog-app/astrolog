import { Tab } from '@/components/ui/custom/tab';
import styles from './analytics.module.scss';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import SessionsChart from '@/components/analytics/sessionsChart';
import { EquipmentChart } from '@/components/analytics/equipmentChart';
import { IntegrationChart } from '@/components/analytics/integrationChart';
import InfoCard from '@/components/analytics/infoCard';

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
          <InfoCard className={styles.infoCard} index={0} />
          <InfoCard className={styles.infoCard} index={1} />
          <InfoCard className={styles.infoCard} index={2} />
        </div>
        <div className={styles.chartGroup}>
          <EquipmentChart className={styles.equipmentChart} />
          <IntegrationChart className={styles.integrationChart} />
        </div>
        <div className={styles.chartGroup}>
          <InfoCard className={styles.infoCard} index={3} />
          <InfoCard className={styles.infoCard} index={4} />
          <InfoCard className={styles.infoCard} index={5} />
          <InfoCard className={styles.infoCard} index={6} />
        </div>
      </div>
    </Tab>
  );
}
