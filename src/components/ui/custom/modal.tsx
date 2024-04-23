import styles from './modal.module.scss';

import { cn } from '@/lib/utils';

interface modalProps {
  className?: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({
  className,
  title,
  isOpen,
  onClose,
  children,
}: modalProps) {
  const closeSvg = (
    <svg
      fill="#000000"
      version="1.1"
      id="Capa_1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 47.971 47.971"
    >
      <g>
        <path
          d="M28.228,23.986L47.092,5.122c1.172-1.171,1.172-3.071,0-4.242c-1.172-1.172-3.07-1.172-4.242,0L23.986,19.744L5.121,0.88
       c-1.172-1.172-3.07-1.172-4.242,0c-1.172,1.171-1.172,3.071,0,4.242l18.865,18.864L0.879,42.85c-1.172,1.171-1.172,3.071,0,4.242
       C1.465,47.677,2.233,47.97,3,47.97s1.535-0.293,2.121-0.879l18.865-18.864L42.85,47.091c0.586,0.586,1.354,0.879,2.121,0.879
       s1.535-0.293,2.121-0.879c1.172-1.171,1.172-3.071,0-4.242L28.228,23.986z"
        />
      </g>
    </svg>
  );

  return (
    <div>
      {isOpen && (
        <div className={styles.background}>
          <div className={cn(className, styles.modal)}>
            <div className={styles.close} onClick={onClose}>
              {closeSvg}
            </div>
            <div className={styles.title}>{title}</div>
            <div>{children}</div>
          </div>
        </div>
      )}
    </div>
  );
}
