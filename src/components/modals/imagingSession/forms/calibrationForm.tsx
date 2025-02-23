'use client';

import {
  Form
} from '@/components/ui/form';
import React, { Dispatch, SetStateAction } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './calibrationForm.module.scss';
import { ButtonBar } from '@/components/ui/custom/modal';
import { ImagingSessionCalibration } from '@/interfaces/imagingSessionEdit';
import { ImagingSessionCalibrationSchema } from '@/schemas/imagingSessionSchema';

interface CalibrationFormProps {
  isEdit: boolean,
  setCalibration: Dispatch<SetStateAction<ImagingSessionCalibration>>,
  editSession: () => void,
  classifySession: () => void,
}

export default function CalibrationForm({ isEdit, setCalibration, editSession, classifySession }: CalibrationFormProps) {
  const form = useForm<z.infer<typeof ImagingSessionCalibrationSchema>>({
    resolver: zodResolver(ImagingSessionCalibrationSchema),
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

        <ButtonBar>{isEdit ? "Save" : "Classify"}</ButtonBar>
      </form>
    </Form>
  );
}
