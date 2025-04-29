'use client';

import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import React, { Dispatch, SetStateAction, useRef } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './calibrationForm.module.scss';
import { ButtonBar } from '@/components/ui/custom/modal';
import { ImagingSessionCalibration } from '@/interfaces/imagingSessionEdit';
import { ImagingSessionCalibrationSchema } from '@/schemas/imagingSessionSchema';
import { Button } from '@/components/ui/button';
import { BiasFrameComboBox, DarkFrameComboBox } from '@/components/ui/comboBox';
import { UUID } from 'crypto';
import FileListSelector from '@/components/fileSelectors/fileListSelector';

interface CalibrationFormProps {
  prevTab: () => void,
  isEdit: boolean,
  isDslr: boolean,
  calibration: ImagingSessionCalibration,
  setCalibration: Dispatch<SetStateAction<ImagingSessionCalibration>>,
  editSession: (newCalibration: ImagingSessionCalibration) => void,
  classifySession: (newCalibration: ImagingSessionCalibration) => void,
}

export default function CalibrationForm({ prevTab, isEdit, isDslr, calibration, setCalibration, editSession, classifySession }: CalibrationFormProps) {
  const submitAction = useRef<"next" | "prev" | null>(null);

  const form = useForm<z.infer<typeof ImagingSessionCalibrationSchema>>({
    resolver: zodResolver(ImagingSessionCalibrationSchema),
    defaultValues: {
      dark_frames_to_classify: calibration?.dark_frames_to_classify ?? [],
      flat_frames_to_classify: calibration?.flat_frames_to_classify ?? [],
      dark_frame_list_id: calibration?.dark_frame_list_id,
      bias_frame_list_id: calibration?.bias_frame_list_id,
    }
  });

  function onSubmit() {
    if (isEdit) {
      // TODO
      // editSession();
      return;
    }

    const values = form.getValues();
    const newCalibration: ImagingSessionCalibration = {
      dark_frame_list_id: values.dark_frame_list_id as UUID | undefined,
      bias_frame_list_id: values.bias_frame_list_id as UUID | undefined,
      flat_frames_to_classify: values.flat_frames_to_classify,
      dark_frames_to_classify: values.dark_frames_to_classify
    }

    // special since its last
    if (submitAction.current === "next") {
      classifySession(newCalibration);
    } else if (submitAction.current === "prev") {
      setCalibration(newCalibration);
      prevTab();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>

        <FormField
          control={form.control}
          name="flat_frames_to_classify"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Flat Frames</FormLabel>
              <FormControl>
                <FileListSelector {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isDslr ? (
          <FormField
            control={form.control}
            name="dark_frames_to_classify"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Dark Frames</FormLabel>
                <FormControl>
                  <FileListSelector {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="dark_frame_list_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Dark Frames</FormLabel>
                <FormControl>
                  <DarkFrameComboBox value={field.value as UUID | undefined} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="bias_frame_list_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Bias Frames</FormLabel>
              <FormControl>
                <BiasFrameComboBox value={field.value as UUID | undefined} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ButtonBar name={isEdit ? "Save" : "Classify"} onClick={() => (submitAction.current = "next")}>
          <Button
            variant='secondary'
            onClick={() => (submitAction.current = "prev")}
          >
            Prev
          </Button>
        </ButtonBar>
      </form>
    </Form>
  );
}
