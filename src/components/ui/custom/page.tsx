import styles from './page.module.scss';

import { cn } from '@/lib/utils';

export function Page({ className, children }: { className?: string, children?: React.ReactNode }) {
  return <div className={cn(className, styles.page)}>{children}</div>;
}
