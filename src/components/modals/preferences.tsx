import { Modal } from '../ui/custom/modal';
import styles from './preferences.module.scss';

interface preferencesProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Preferences({ isOpen, onClose }: preferencesProps) {
  return (
    <Modal
      title="Preferences"
      subtitle="Test"
      divider={true}
      isOpen={isOpen}
      onClose={onClose}
    >
      Test
    </Modal>
  );
}
