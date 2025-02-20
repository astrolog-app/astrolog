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

const formSchema = z.object({
  target: z.array(z.string()).min(1, {
    message: 'You must at least select one light frame.',
  }),
});

export default function NewImagingSession() {
  const { openModal } = useModal();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      target: [],
    },
  });

  function onSubmit() {
    openModal(<ImagingSessionEditor session={undefined} />);
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
            name="target"
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
