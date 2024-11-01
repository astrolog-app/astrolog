import styles from './equipment.module.scss';
import { Modal } from '@/components/ui/custom/modal';
import { EquipmentType } from '@/enums/equipmentType';
import EquipmentComboBox from '@/components/ui/equipmentComboBox';

interface EquipmentProps {
  type: EquipmentType
}

export default function EquipmentModal({ type }: EquipmentProps) {
  return (
    <Modal
      title={"Add " + type}
    >
      <EquipmentComboBox type={type} value="" onChange={() => {}} />
    </Modal>
  );
}
