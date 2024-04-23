import styles from './tab.module.scss';

import { cn } from '@/lib/utils';

export function Tab({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return <div className={cn(className, styles.page)}>{children}</div>;
}
