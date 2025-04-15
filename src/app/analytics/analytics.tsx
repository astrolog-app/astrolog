'use client';

import { Tab } from '@/components/ui/custom/tab';
import styles from './analytics.module.scss';
import SessionsChart from '@/components/analytics/sessionsChart';
import InfoCard from '@/components/analytics/infoCard';
import HeaderCard from '@/components/headerCard';
import { useAppState } from '@/context/stateProvider';
import { Card } from '@/components/ui/card';

export function Analytics() {
  const { appState } = useAppState();

  return (
    <Tab className={styles.tab}>
      <HeaderCard
        title="Analytics"
        subtitle="View the analytics of your imaging sessions."
      />
      {appState.analytics === null
        ? (
          <Card className='flex-1'>
            <div className="flex-1 flex items-center justify-center text-muted-foreground h-full">No analytics available.</div>
          </Card>
        )
        : (
          <div className={styles.lower}>
            <div className={styles.infoCards}>
              <InfoCard infoCard={appState.analytics.info_cards.total_exposure_time} />
              <InfoCard infoCard={appState.analytics.info_cards.average_seeing} />
              <InfoCard infoCard={appState.analytics.info_cards.total_imaging_session} />
              <InfoCard infoCard={appState.analytics.info_cards.unique_targets} />
            </div>
            <SessionsChart data={appState.analytics.sessions_chart} />
          </div>
        )
      }
    </Tab>
  );
}
