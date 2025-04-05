'use client';

import styles from './equipment.module.scss';
import { ButtonBar, Modal } from '@/components/ui/custom/modal';
import { EquipmentType } from '@/enums/equipmentType';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Camera, EquipmentItem, EquipmentNote, Filter, Flattener, Telescope } from '@/interfaces/equipment';
import { v4 as uuidv4 } from 'uuid';
import { invoke } from '@tauri-apps/api/core';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { getViewName } from '@/utils/equipment';
import { useAppState } from '@/context/stateProvider';
import { useModal } from '@/context/modalProvider';
import { EquipmentList } from '@/interfaces/state';
import { EquipmentFormValues, equipmentSchema } from '@/schemas/equipmentSchema';
import { UUID } from 'crypto';

export const saveEquipment: Record<EquipmentType, { invokeFn: string; key: keyof EquipmentList }> = {
  [EquipmentType.TELESCOPE]: { invokeFn: 'save_telescope', key: 'telescopes' },
  [EquipmentType.CAMERA]: { invokeFn: 'save_camera', key: 'cameras' },
  [EquipmentType.MOUNT]: { invokeFn: 'save_mount', key: 'mounts' },
  [EquipmentType.FILTER]: { invokeFn: 'save_filter', key: 'filters' },
  [EquipmentType.FLATTENER]: { invokeFn: 'save_flattener', key: 'flatteners' }
};


interface EquipmentProps {
  type: EquipmentType;
  item?: EquipmentItem;
}

// TODO: deselects selected item when item is edited
// TODO: add scrollbar
export default function EquipmentModal({ type, item }: EquipmentProps) {
  const { setAppState } = useAppState();
  const { closeModal } = useModal();

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
  const isEdit = item !== undefined;

  let modalTitle = 'Add ' + equipmentType;
  let modalSubtitle = "Enter the details of your new " + equipmentType + " here.";
  if (isEdit) {
    modalTitle = 'Edit ' + equipmentType;
    modalSubtitle = "Enter the details of your " + equipmentType + " here.";
  }

  // TODO: test
  function onSubmit(values: EquipmentFormValues) {
    const id = item?.id ?? uuidv4();
    const new_item: EquipmentItem = {
      id: id,
      notes: item?.notes ?? new Map<UUID, EquipmentNote>(),
      ...values
    } as EquipmentItem;

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
      title={modalTitle}
      subtitle={modalSubtitle}
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
                    <SelectTrigger
                      disabled={isEdit}
                    >
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
          <ButtonBar>
            Save {equipmentType}
          </ButtonBar>
        </form>
      </Form>
    </Modal>
  );
}
