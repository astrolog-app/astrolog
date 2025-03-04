import { Tab } from '@/components/ui/custom/tab';
import styles from './analytics.module.scss';
import SessionsChart from '@/components/analytics/sessionsChart';
import { EquipmentChart } from '@/components/analytics/equipmentChart';
import { IntegrationChart } from '@/components/analytics/integrationChart';
import InfoCard from '@/components/analytics/infoCard';
import HeaderCard from '@/components/headerCard';

export function Analytics() {
  return (
    <Tab>
      <HeaderCard
        title="Analytics"
        subtitle="View the analytics of your imaging sessions."
      />
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
