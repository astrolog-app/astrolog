'use client';

import { CloseSVG } from '@/public/svgs';
import { Separator } from '../separator';
import styles from './modal.module.scss';
import { useModal } from '@/context/modalProvider';
import { motion } from 'framer-motion';
import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/classNames';

interface ModalProps {
  className?: string;
  title?: string;
  subtitle?: string;
  separator?: boolean;
  children: React.ReactNode;
  notClosable?: boolean;
}

export function Modal({
                        className,
                        title,
                        subtitle,
                        separator,
                        children,
                        notClosable
                      }: ModalProps) {
  const { closeModal } = useModal();

  return (
    <motion.div
      className={styles.background}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.05 }}
    >
      <div className={styles.modalWrapper}>
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.05 }}
        >
          {!notClosable && (
            <div className={styles.close} onClick={closeModal}>
              <CloseSVG />
            </div>
          )}
          <div className={styles.header}>
            <div className={styles.title}>{title}</div>
            <div className={styles.subtitle}>{subtitle}</div>
            {separator && <Separator className={styles.separator} />}
          </div>
          <div className={className}>{children}</div>
        </motion.div>
      </div>
    </motion.div>
  );
}

interface ButtonBarProps {
  children: ReactNode;
  classname?: string;
  cancelButton?: boolean;
}

export function ButtonBar({ children, classname, cancelButton }: ButtonBarProps) {
  const { closeModal } = useModal();

  return (
    <div className={cn(classname, styles.buttonBar)}>
      {cancelButton && (
        <Button
          type="button"
          variant="secondary"
          onClick={() => closeModal()}
        >
          Cancel
        </Button>
      )}
      <Button
        type="submit"
      >
        {children}
      </Button>
    </div>
  );
}
