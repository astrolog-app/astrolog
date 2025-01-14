import { EquipmentItem } from '@/interfaces/equipment';

interface EquipmentDetailsProps {
  selectedItem: EquipmentItem | undefined;
}

export default function EquipmentDetails({
  selectedItem,
}: EquipmentDetailsProps) {
  return <div>{selectedItem?.name}</div>;
}
