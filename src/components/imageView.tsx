import styles from './imageView.module.scss';
import { Card, CardHeader } from './ui/card';

export default function ImageView({ className }: { className?: string }) {
    return (
        <Card className={className}>
            <CardHeader>
                <div className={styles.title}>
                    NGC 7000
                </div>
                <div className={styles.image} />
            </CardHeader>
        </Card>
    );
}
