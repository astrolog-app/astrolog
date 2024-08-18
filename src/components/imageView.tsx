import styles from './imageView.module.scss';
import { Card, CardHeader } from './ui/card';

interface ImageViewProps {
  className?: string;
  title: string;
}

export default function ImageView({ className, title }: ImageViewProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className={styles.title}>{title}</div>
        <div className={styles.image} />
      </CardHeader>
    </Card>
  );
}
