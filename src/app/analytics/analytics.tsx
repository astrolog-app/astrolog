'use client';

import { Tab } from '@/components/ui/custom/tab';
import styles from './analytics.module.scss';
import SessionsChart from '@/components/analytics/sessionsChart';
import InfoCard from '@/components/analytics/infoCard';
import HeaderCard from '@/components/headerCard';
import { useAppState } from '@/context/stateProvider';

export function Analytics() {
  const { appState } = useAppState();

  return (
    <Tab>
      <HeaderCard
        title="Analytics"
        subtitle="View the analytics of your imaging sessions."
      />
      {appState.analytics === null
        ? <div>No Data.</div>
        : (
          <div className={styles.lower}>
            <div className={styles.infoCards}>
              <InfoCard infoCard={appState.analytics.info_cards.total_exposure_time} />
              <InfoCard infoCard={appState.analytics.info_cards.average_seeing} />
              <InfoCard infoCard={appState.analytics.info_cards.total_imaging_session} />
              <InfoCard infoCard={appState.analytics.info_cards.unique_targets} />
            </div>
            <SessionsChart />
          </div>
        )
      }
    </Tab>
  );
}
