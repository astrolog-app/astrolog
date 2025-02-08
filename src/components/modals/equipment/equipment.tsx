'use client';

import styles from './equipment.module.scss';
import { Modal } from '@/components/ui/custom/modal';
import { EquipmentType } from '@/enums/equipmentType';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Camera, EquipmentItem, Filter, Flattener, Telescope } from '@/interfaces/equipment';
import { v4 as uuidv4 } from 'uuid';
import { invoke } from '@tauri-apps/api/core';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { getViewName } from '@/utils/equipment';
import { useAppState } from '@/context/stateProvider';
import { useModal } from '@/context/modalProvider';
import { EquipmentList } from '@/interfaces/state';

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
  rgb: z.boolean()
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

interface EquipmentProps {
  type: EquipmentType;
  item?: EquipmentItem;
}

export default function EquipmentModal({ type, item }: EquipmentProps) {
  const { setAppState } = useAppState();
  const { closeModal } = useModal();
  const isEdit = item !== undefined;

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      type: type,
      brand: item?.brand,
      name: item?.name,
      focal_length: (item as Telescope)?.focal_length,
      aperture: (item as Telescope)?.aperture,
      chip_size: (item as Camera)?.chip_size,
      mega_pixel: (item as Camera)?.mega_pixel,
      rgb: (item as Camera)?.rgb,
      filter_type: (item as Filter)?.filter_type,
      factor: (item as Flattener)?.factor,
    }
  });

  const equipmentType = form.watch('type');

  // TODO: test
  function onSubmit(values: EquipmentFormValues) {
    const id = item?.id ?? uuidv4();
    const new_item: EquipmentItem = {
      id: id,
      ...values
    } as EquipmentItem;

    const saveEquipment: Record<EquipmentType, { invokeFn: string; key: keyof EquipmentList }> = {
      [EquipmentType.TELESCOPE]: { invokeFn: 'save_telescope', key: 'telescopes' },
      [EquipmentType.CAMERA]: { invokeFn: 'save_camera', key: 'cameras' },
      [EquipmentType.MOUNT]: { invokeFn: 'save_mount', key: 'mounts' },
      [EquipmentType.FILTER]: { invokeFn: 'save_filter', key: 'filters' },
      [EquipmentType.FLATTENER]: { invokeFn: 'save_flattener', key: 'flatteners' }
    };

    invoke('check_equipment_duplicate', { viewName: getViewName(new_item), isEdit: isEdit })
      .then(() => {
        const equipment = saveEquipment[equipmentType];
        if (!equipment) return;

        invoke(equipment.invokeFn, { [equipment.key.slice(0, -1)]: new_item })
          .then(() => {
            setAppState(prevState => ({
              ...prevState,
              equipment_list: {
                ...prevState.equipment_list,
                [equipment.key]: new Map(prevState.equipment_list[equipment.key]).set(new_item.id, new_item)
              }
            }));
            toast({ description: `Saved ${equipmentType} successfully!` });
            closeModal();
          })
          .catch((error) => {
            toast({
              variant: 'destructive',
              title: 'Uh oh! Something went wrong.',
              description: 'Error: ' + error,
            });
          });
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'Error: ' + error,
        });
      });
  }

  return (
    <Modal
      title={'Add ' + equipmentType}
      subtitle={"Enter the details of your new " + equipmentType + " here."}
      separator
      className={styles.modal}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipment Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(EquipmentType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="Enter brand" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {equipmentType === EquipmentType.TELESCOPE && (
            <>
              <FormField
                control={form.control}
                name="focal_length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Focal Length (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter focal length"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="aperture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aperture (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter aperture"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          {equipmentType === EquipmentType.CAMERA && (
            <>
              <FormField
                control={form.control}
                name="chip_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chip Size</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter chip size" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mega_pixel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mega Pixels</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter mega pixels"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rgb"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">RGB</FormLabel>
                      <FormDescription>
                        Is this an RGB camera?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </>
          )}
          {equipmentType === EquipmentType.FILTER && (
            <FormField
              control={form.control}
              name="filter_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filter Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter filter type" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {equipmentType === EquipmentType.FLATTENER && (
            <FormField
              control={form.control}
              name="factor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Factor</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter factor"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button type="submit">Save Equipment</Button>
        </form>
      </Form>
    </Modal>
  );
}
