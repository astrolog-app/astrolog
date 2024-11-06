import { EquipmentItem } from '@/interfaces/equipment';

export function getViewName(item: EquipmentItem): string {
  return item.brand + " " + item.name;
}
