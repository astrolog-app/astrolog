'use client';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import React, { Dispatch, SetStateAction } from 'react';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './calibrationForm.module.scss';
import { ButtonBar } from '@/components/ui/custom/modal';
import { ImagingSessionCalibration } from '@/interfaces/imagingSessionEdit';

const formSchema = z.object({
  target: z.string().min(2, {
    message: 'Username must be at least 2 characters.', // change
  }),
});

interface CalibrationFormProps {
  isEdit: boolean,
  setCalibration: Dispatch<SetStateAction<ImagingSessionCalibration>>,
  editSession: () => void,
  classifySession: () => void,
}

export default function CalibrationForm({ isEdit, setCalibration, editSession, classifySession }: CalibrationFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      target: '',
    },
  });

  function onSubmit() {
    if (isEdit) {
      // TODO
      editSession();
      return;
    }

    classifySession();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
        <FormField
          control={form.control}
          name="target"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Root Directory</FormLabel>
              <FormControl>
                <Input />
              </FormControl>
              <FormDescription>
                The directory in your filesystem where all of your astrophotos
                are
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <ButtonBar>{isEdit ? "Save" : "Classify"}</ButtonBar>
      </form>
    </Form>
  );
}
