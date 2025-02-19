'use client';

import { TrendingUp } from 'lucide-react';
import { Card, CardHeader } from '../ui/card';
import styles from './infoCard.module.scss';
import { useAppState } from '@/context/stateProvider';

interface InfoCardProps {
  className?: string;
  index: number;
}

export default function InfoCard({ className, index }: InfoCardProps) {
  const { appState } = useAppState();

  const infoCard = appState.analytics.info_cards.at(index);

  if (!infoCard) {
    return; // TODO
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className={styles.title}>{infoCard.title}</div>
        <div className={styles.content}>{infoCard.data}</div>
        <div className={styles.subtitle}>
          +2 from last month <TrendingUp className={styles.arrow} />
        </div>
      </CardHeader>
    </Card>
  );
}
