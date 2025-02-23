'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import React, { Dispatch, SetStateAction } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './equipmentForm.module.scss';
import EquipmentComboBox from '@/components/ui/equipmentComboBox';
import { EquipmentType } from '@/enums/equipmentType';
import { ImagingSessionEquipmentSchema } from '@/schemas/imagingSessionSchema';
import { TabKey } from '@/components/modals/imagingSession/imagingSessionEditor';
import { ImagingSessionEquipment } from '@/interfaces/imagingSessionEdit';
import { ButtonBar } from '@/components/ui/custom/modal';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';

interface EquipmentFormFormProps {
  setTab: Dispatch<SetStateAction<TabKey>>
  isEdit: boolean,
  setEquipment: Dispatch<SetStateAction<ImagingSessionEquipment | undefined>>,
  editSession: () => void,
}

export default function EquipmentForm({ setTab, isEdit, setEquipment, editSession }: EquipmentFormFormProps) {
  const form = useForm<z.infer<typeof ImagingSessionEquipmentSchema>>({
    resolver: zodResolver(ImagingSessionEquipmentSchema),
  });

  function onSubmit() {
    if (isEdit) {
      // TODO
      editSession();
      return;
    }

    const values = form.getValues();
    const equipment: ImagingSessionEquipment = {
      camera_id: uuidv4() as UUID,
      telescope_id: uuidv4() as UUID,
      flattener_id: uuidv4() as UUID,
      mount_id: uuidv4() as UUID,
      filter_id: uuidv4() as UUID,
    }
    setEquipment(equipment);
    setTab('weather');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
        <FormField
          control={form.control}
          name="telescope"
          render={({ field }) => (
            <FormItem className={styles.item}>
              <FormControl>
                <EquipmentComboBox type={EquipmentType.TELESCOPE} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="camera"
          render={({ field }) => (
            <FormItem className={styles.item}>
              <FormControl>
                <EquipmentComboBox type={EquipmentType.CAMERA} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mount"
          render={({ field }) => (
            <FormItem className={styles.item}>
              <FormControl>
                <EquipmentComboBox type={EquipmentType.MOUNT} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="filter"
          render={({ field }) => (
            <FormItem className={styles.item}>
              <FormControl>
                <EquipmentComboBox type={EquipmentType.FILTER} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="flattener"
          render={({ field }) => (
            <FormItem className={styles.item}>
              <FormControl>
                <EquipmentComboBox type={EquipmentType.FLATTENER} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <ButtonBar>{isEdit ? "Save" : "Next"}</ButtonBar>
      </form>
    </Form>
  );
}
