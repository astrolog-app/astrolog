import styles from './tab.module.scss';

import { cn } from '@/utils/classNames';

export function Tab({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return <div className={cn(className, styles.page)}>{children}</div>;
}
