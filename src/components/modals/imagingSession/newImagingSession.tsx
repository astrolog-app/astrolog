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
  FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import FileListSelector from '@/components/fileSelectors/fileListSelector';
import { useModal } from '@/context/modalProvider';
import ImagingSessionEditor from '@/components/modals/imagingSession/imagingSessionEditor';
import { ImagingSessionBaseSchema } from '@/schemas/imagingSessionSchema';
import { ImagingSessionBase } from '@/interfaces/imagingSessionEdit';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';
import { useAppState } from '@/context/stateProvider';
import { AppState } from '@/interfaces/state';
import { toast } from '@/components/ui/use-toast';

export default function NewImagingSession() {
  const { openModal } = useModal();

  const form = useForm<z.infer<typeof ImagingSessionBaseSchema>>({
    resolver: zodResolver(ImagingSessionBaseSchema),
    defaultValues: {
      frames: []
    }
  });

  function onSubmit() {
    const base: ImagingSessionBase = {
      id: uuidv4() as UUID,
      frames: form.getValues().frames
    };

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

export function newImagingSession({ open, appState }: { open: () => void, appState: AppState }) {
  if (appState.config.folder_paths.imaging_session_base_folder === "" || appState.config.folder_paths.imaging_session_pattern === "") {
    toast({
      variant: 'destructive',
      title: 'Uh oh! Something went wrong.',
      description: 'You have to set a folder path for your imaging sessions (preferences)!'
    });

    return;
  }

  if (appState.config.locations.size === 0) {
    toast({
      variant: 'destructive',
      title: 'Uh oh! Something went wrong.',
      description: 'You have to set at least one location (preferences)!'
    });

    return;
  }

  if (appState.equipment_list.cameras.size === 0) {
    toast({
      variant: 'destructive',
      title: 'Uh oh! Something went wrong.',
      description: 'You have to add at least one camera to your equipment list!!'
    });

    return;
  }

  if (appState.equipment_list.telescopes.size === 0) {
    toast({
      variant: 'destructive',
      title: 'Uh oh! Something went wrong.',
      description: 'You have to add at least one telescope to your equipment list!!'
    });

    return;
  }

  if (appState.equipment_list.mounts.size === 0) {
    toast({
      variant: 'destructive',
      title: 'Uh oh! Something went wrong.',
      description: 'You have to add at least one mount to your equipment list!!'
    });

    return;
  }

  open()
}
