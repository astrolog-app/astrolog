import styles from './modal.module.scss';

interface modalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: modalProps) {
  return (
    <div>
      {isOpen && (
        <div className={styles.background}>
          <div className={styles.modal}>{children}</div>
        </div>
      )}
    </div>
  );
}
