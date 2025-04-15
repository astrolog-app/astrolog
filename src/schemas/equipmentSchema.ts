import * as z from 'zod';
import { EquipmentType } from '@/enums/equipmentType';

const baseEquipmentSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  name: z.string().min(1, 'Name is required')
});

export const telescopeSchema = baseEquipmentSchema.extend({
  focal_length: z.number().positive('Focal length must be a positive number'),
  aperture: z.number().positive('Aperture must be a positive number')
});

export const cameraSchema = baseEquipmentSchema.extend({
  chip_size: z.string().min(1, 'Chip size is required'),
  mega_pixel: z.number().positive('Mega pixel must be a positive number'),
  is_monochrome: z.boolean().default(false),
  is_dslr: z.boolean().default(false)
});

export const mountSchema = baseEquipmentSchema;

export const filterSchema = baseEquipmentSchema.extend({
  filter_type: z.string().min(1, 'Filter type is required')
});

export const flattenerSchema = baseEquipmentSchema.extend({
  factor: z.number().positive('Factor must be a positive number')
});

export const equipmentSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal(EquipmentType.TELESCOPE), ...telescopeSchema.shape }),
  z.object({ type: z.literal(EquipmentType.CAMERA), ...cameraSchema.shape }),
  z.object({ type: z.literal(EquipmentType.MOUNT), ...mountSchema.shape }),
  z.object({ type: z.literal(EquipmentType.FILTER), ...filterSchema.shape }),
  z.object({ type: z.literal(EquipmentType.FLATTENER), ...flattenerSchema.shape })
]);

export type EquipmentFormValues = z.infer<typeof equipmentSchema>
