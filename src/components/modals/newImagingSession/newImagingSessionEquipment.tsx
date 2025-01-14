'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './newImagingSessionEquipment.module.scss';
import EquipmentComboBox from '@/components/ui/equipmentComboBox';
import { Button } from '@/components/ui/button';
import { useModal } from '@/context/modalProvider';
import { TabKey } from '@/components/modals/newImagingSession/newImagingSession';
import { EquipmentType } from '@/enums/equipmentType';

const formSchema = z.object({
  telescope: z.string().min(2, {
    message: 'Username must be at least 2 characters.', // change
  }),
  camera: z.string().min(2, {
    message: 'Username must be at least 2 characters.', // change
  }),
  mount: z.string().min(2, {
    message: 'Username must be at least 2 characters.', // change
  }),
  filter: z.string().min(2, {
    message: 'Username must be at least 2 characters.', // change
  }),
  flattener: z.string().min(2, {
    message: 'Username must be at least 2 characters.', // change
  }),
});

export default function NewImagingSessionEquipment({
  setSelectedTab,
}: {
  setSelectedTab: React.Dispatch<React.SetStateAction<TabKey | undefined>>;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { closeModal } = useModal();

  function onSubmit() {
    setSelectedTab('calibration');
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
        <div className={styles.buttons}>
          <Button
            type="button"
            variant="secondary"
            onClick={closeModal}
            className={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </Form>
  );
}
