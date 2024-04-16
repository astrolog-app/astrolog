import styles from './page.module.scss';

export function Page({ children }: { children?: React.ReactNode }) {
  return <div className={styles.page}>{children}</div>;
}
