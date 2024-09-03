'use client';

import styles from './newImagingSession.module.scss';
import { Modal } from '@/components/ui/custom/modal';
import React, { useState } from 'react';
import NewImagingSessionCalibration from '@/components/modals/newImagingSession/newImagingSessionCalibration';
import NewImagingSessionEquipment from '@/components/modals/newImagingSession/newImagingSessionEquipment';
import NewImagingSessionGeneral from '@/components/modals/newImagingSession/newImagingSessionGeneral';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import FileListSelector from '@/components/fileSelectors/fileListSelector';

const tabKeys = ['general', 'equipment', 'calibration'] as const;
export type TabKey = typeof tabKeys[number];

export default function NewImagingSession() {
  const [selectedTab, setSelectedTab] = useState<TabKey>();

  function renderTab(): React.ReactNode {
    switch (selectedTab) {
      case 'general':
        return <NewImagingSessionGeneral setSelectedTab={setSelectedTab} />;
      case 'equipment':
        return <NewImagingSessionEquipment />;
      case 'calibration':
        return <NewImagingSessionCalibration />;
      default:
        return <SelectLightFrames setSelectedTab={setSelectedTab} />;
    }
  }

  return (
    <Modal
      title="Add Imaging Session"
      separator
      className={styles.modal}
    >
      {renderTab()}
    </Modal>
  );
}

const formSchema = z.object({
  target: z.array(z.string()).min(1, {
    message: 'You must at least select one light frame.'
  })
});

function SelectLightFrames({ setSelectedTab }: {
  setSelectedTab: React.Dispatch<React.SetStateAction<TabKey | undefined>>
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      target: []
    }
  });

  function onSubmit() {
    setSelectedTab('general');
  }

  return (
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
        <Button className={styles.nextButton} type="submit">Next</Button>
      </form>
    </Form>
  );
}
