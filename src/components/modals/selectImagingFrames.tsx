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

export default function SelectImagingFrames() {
  const { openModal } = useModal();

  const formSchema = z.object({
    target: z.array(z.string()).min(1, {
      message: 'You must at least select one calibration frame.'
    })
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      target: []
    }
  });

  function onSubmit() {
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
            name="target"
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
