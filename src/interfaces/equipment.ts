import { UUID } from 'crypto';
import { EquipmentType } from '@/enums/equipmentType';

export interface EquipmentNote {
  id: UUID,
  date: Date,
  note: string,
}

export interface EquipmentItem {
  id: UUID;
  brand: string;
  name: string;
  notes: Map<UUID, EquipmentNote>,
}

export interface Telescope extends EquipmentItem {
  focal_length: number;
  aperture: number;
}

export interface Camera extends EquipmentItem {
  chip_size: string;
  mega_pixel: number;
  rgb: boolean;
}

export interface Mount extends EquipmentItem {}

export interface Filter extends EquipmentItem {
  filter_type: string;
}

export interface Flattener extends EquipmentItem {
  factor: number;
}

export const getEquipmentType = (
  item: EquipmentItem
): EquipmentType => {
  if ("focal_length" in item) {
    return EquipmentType.TELESCOPE;
  }
  if ("chip_size" in item) {
    return EquipmentType.CAMERA;
  }
  if ("filter_type" in item) {
    return EquipmentType.FILTER;
  }
  if ("factor" in item) {
    return EquipmentType.FLATTENER;
  }

  return EquipmentType.MOUNT;
};
