import styles from './topBar.module.scss';
import { ThemeToggle } from './ui/custom/themeToggle';

export function TopBar() {
  return (
    <div className={styles.topBar}>
      <div>MenuBar</div>
      <ThemeToggle></ThemeToggle>
    </div>
  );
}
