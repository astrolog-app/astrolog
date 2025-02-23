'use client';

import styles from './newImagingSession.module.scss';
import { Modal } from '@/components/ui/custom/modal';
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import FileListSelector from '@/components/fileSelectors/fileListSelector';
import { useModal } from '@/context/modalProvider';
import ImagingSessionEditor from '@/components/modals/imagingSession/imagingSessionEditor';
import { baseImagingSessionSchema } from '@/schemas/imagingSessionSchema';
import { ImagingSessionBase } from '@/interfaces/imagingSessionEdit';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';

export default function NewImagingSession() {
  const { openModal } = useModal();

  const form = useForm<z.infer<typeof baseImagingSessionSchema>>({
    resolver: zodResolver(baseImagingSessionSchema),
    defaultValues: {
      frames: [],
    },
  });

  function onSubmit() {
    const base: ImagingSessionBase = {
      id: uuidv4() as UUID,
      frames: form.getValues().frames
    }

    openModal(<ImagingSessionEditor base={base} />);
  }

  return (
    <Modal
      title="Add Imaging Session"
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
                <FormLabel>Light Frames</FormLabel>
                <FormDescription>
                  The light frames of your new imaging session.
                </FormDescription>
                <FormControl>
                  <FileListSelector {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className={styles.nextButton} type="submit">
            Next
          </Button>
        </form>
      </Form>
    </Modal>
  );
}
