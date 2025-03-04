import styles from './headerCard.module.scss';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

interface HeaderCardProps {
  children?: ReactNode,
  title: string,
  subtitle?: string
}

export default function HeaderCard({ children, title, subtitle }: HeaderCardProps) {
  return (
    <Card className={styles.component}>
      <CardHeader className={styles.header}>
        <div>
          <CardTitle className={styles.title}>{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </div>
        <div className={styles.children}>{children}</div>
      </CardHeader>
    </Card>
  );
}