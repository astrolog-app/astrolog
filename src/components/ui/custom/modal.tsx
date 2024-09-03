'use client';

import { CloseSVG } from '@/app/svgs';
import { Separator } from '../separator';
import styles from './modal.module.scss';
import { useModal } from '@/context/modalProvider';

interface ModalProps {
  className?: string;
  title?: string;
  subtitle?: string;
  separator?: boolean;
  children: React.ReactNode;
}

export function Modal({
  className,
  title,
  subtitle,
  separator,
  children,
}: ModalProps) {
  const { closeModal } = useModal();

  return (
    <div className={styles.background}>
      <div className={styles.modal}>
        <div className={styles.close} onClick={closeModal}>
          {CloseSVG}
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
