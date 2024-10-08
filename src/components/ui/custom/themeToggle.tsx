import * as React from 'react';
import styles from './themeToggle.module.scss';
import { useTheme } from 'next-themes';

import { cn } from '../../../utils/classNames';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className={styles.component}>
      <div className={styles.left}>
        <div className={styles.selectableWrapper}>
          <div
            className={cn(
              styles.selectable,
              theme === 'light' ? styles.isSelected : '',
            )}
            onClick={() => setTheme('light')}
          >
            <div className={cn(styles.skeletons, styles.light)}>
              <div className={styles.topSkeleton} />
              <div className={styles.middleSkeleton} />
              <div className={styles.bottomSkeleton} />
            </div>
          </div>
          <div className={styles.selectableSubtitle}>Light</div>
        </div>
        <div className={styles.selectableWrapper}>
          <div
            className={cn(
              styles.selectable,
              theme === 'dark' ? styles.isSelected : '',
            )}
            onClick={() => setTheme('dark')}
          >
            <div className={cn(styles.skeletons, styles.dark)}>
              <div className={styles.topSkeleton} />
              <div className={styles.middleSkeleton} />
              <div className={styles.bottomSkeleton} />
            </div>
          </div>
          <div className={styles.selectableSubtitle}>Dark</div>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.selectableWrapper}>
          <div
            className={cn(
              styles.selectable,
              theme === 'system' ? styles.isSelected : '',
            )}
            onClick={() => setTheme('system')}
          >
            <div className={cn(styles.skeletons, styles.system)}>
              <div className={styles.topSkeleton} />
              <div className={styles.middleSkeleton} />
              <div className={styles.bottomSkeleton} />
            </div>
          </div>
          <div className={styles.selectableSubtitle}>System</div>
        </div>
      </div>
    </div>
  );
}
