import { UUID } from 'crypto';

export interface EquipmentItem {
  id: UUID;
  brand: string;
  name: string;
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
