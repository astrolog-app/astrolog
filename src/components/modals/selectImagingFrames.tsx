'use client';

import { z } from 'zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import FileListSelector from '@/components/fileSelectors/fileListSelector';
import { Button } from '@/components/ui/button';
import styles from './selectImagingFrames.module.scss';
import { Modal } from '@/components/ui/custom/modal';
import { useModal } from '@/context/modalProvider';
import { invoke } from '@tauri-apps/api/core';
import { toast } from '@/components/ui/use-toast';
import CalibrationRowEditor from '@/components/modals/calibrationRowEditor';
import { AnalyzedCalibrationFrames } from '@/interfaces/commands';

export default function SelectImagingFrames() {
  const { openModal } = useModal();

  const formSchema = z.object({
    frames: z.array(z.string()).min(1, {
      message: 'You must at least select one calibration frame.'
    })
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      frames: []
    }
  });

  function onSubmit() {
    invoke<AnalyzedCalibrationFrames>('analyze_calibration_frames', { frames: form.getValues().frames })
      .then((result) => {
        openModal(<CalibrationRowEditor analyzedFrames={result} edit={false} paths={form.getValues().frames} />);
        if (result.message !== null) {
          toast({
            variant: 'destructive',
            title: 'Warning',
            description: result.message
          });
        }
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'Error: ' + error
        });
        openModal(<CalibrationRowEditor edit={false} />);
      });
  }

  return (
    <Modal
      title="Add Calibration Frames"
      separator
      className={styles.modal}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="frames"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calibration Frames</FormLabel>
                <FormDescription>
                  Add new dark OR bias frames.
                </FormDescription>
                <FormControl>
                  <FileListSelector {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className={styles.nextButton} type="submit">Next</Button>
        </form>
      </Form>
    </Modal>
  );
}
