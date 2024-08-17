import { closeSVG } from '@/app/svgs';
import { Separator } from '../separator';
import styles from './modal.module.scss';

interface ModalProps {
  className?: string;
  title?: string;
  subtitle?: string;
  separator?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({
  className,
  title,
  subtitle,
  separator,
  onClose,
  children,
}: ModalProps) {

  return (
    <div className={styles.background}>
      <div className={styles.modal}>
        <div className={styles.close} onClick={onClose}>
          {closeSVG}
        </div>
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          <div className={styles.subtitle}>{subtitle}</div>
          {separator && <Separator className={styles.separator} />}
        </div>
        <div className={className}>{children}</div>
      </div>
    </div>
  );
}
