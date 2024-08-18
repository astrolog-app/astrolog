import { TrendingUp } from 'lucide-react';
import { Card, CardHeader } from '../ui/card';
import styles from './infoCard.module.scss';

export default function InfoCard({ className }: { className?: string }) {
    return (
        <Card className={className}>
            <CardHeader>
                <div className={styles.title}>
                    Total Imaging Sessions
                </div>
                <div className={styles.content}>
                    68
                </div>
                <div className={styles.subtitle}>
                    +2 from last month <TrendingUp className={styles.arrow} />
                </div>
            </CardHeader>
        </Card>
    );
}
