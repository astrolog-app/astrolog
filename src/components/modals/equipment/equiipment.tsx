import styles from './equipment.module.scss';
import { Modal } from '@/components/ui/custom/modal';
import { EquipmentType } from '@/enums/equipmentType';

interface EquipmentProps {
  type: EquipmentType
}

export default function EquipmentModal({ type }: EquipmentProps) {
  return (
    <Modal
      title={"Add " + type}
    >
      <div>test</div>
    </Modal>
  );
}
