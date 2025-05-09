'use client';

import styles from '../preferences.module.scss';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ToastAction } from '@/components/ui/toast';
import { toast, useToast } from '@/components/ui/use-toast';
import { savePreferences, useAppState } from '@/context/stateProvider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import FileSelector, {
  FileSelectorChangeButton,
} from '@/components/fileSelectors/fileSelector';
import { z } from 'zod';
import { invoke } from '@tauri-apps/api/core';
import React from 'react';
import { CopyButton, DeleteButton } from '@/components/ui/button';
import { AppState } from '@/interfaces/state';

const formSchema = z.object({
  rootDirectory: z.string().min(2, {
    message: 'Username must be at least 2 characters.', // change
  }),
  backupDirectory: z.string().min(2, {
    message: 'Username must be at least 2 characters.', // change
  }),
  sourceDirectory: z.string().min(2, {
    message: 'Username must be at least 2 characters.', // change
  }),
});

export default function SourceForm() {
  const { toast } = useToast();
  const { appState } = useAppState();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rootDirectory: appState.local_config.root_directory,
      backupDirectory: '',
      sourceDirectory: appState.local_config.source_directory,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: 'Success',
      description: 'Your preferences have been saved.',
      action: (
        <ToastAction onClick={() => console.log('test')} altText="Undo">
          Undo
        </ToastAction>
      ),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
        <FormField
          control={form.control}
          name="rootDirectory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Root Directory</FormLabel>
              <FormControl>
                <FileSelector
                  value={appState.local_config.root_directory}
                  disabled
                >
                  <CopyButton
                    value={appState.local_config.root_directory}
                  />
                  <FileSelectorChangeButton
                    path="local_config.root_directory"
                    saveAction={(value, appState, setAppState, path) =>
                      rootAction(value, appState, setAppState, path)
                    }
                    name="Move"
                    confirmDialog
                    directory
                  />
                </FileSelector>
              </FormControl>
              <FormDescription>
                The directory in your filesystem where all of your astrophotos
                are stored. For a better user experience, this data should be
                available fast (e.g. on your computer).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/*<FormField
          control={form.control}
          name="backupDirectory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Backup Directory (Optional)</FormLabel>
              <FormControl>
                <FileSelector
                  value={''}
                  disabled
                >
                  <DeleteButton
                    value={''}
                    path="local_config.backup_directory"
                    saveAction={savePreferences}
                  />
                  <CopyButton
                    value={''}
                  />
                  <FileSelectorChangeButton
                    path="preferences.storage.backup_directory"
                    saveAction={(value, appState, setAppState, path) =>
                      backupAction(value, appState, setAppState, path)
                    }
                    name="Move"
                    directory
                  />
                </FileSelector>
              </FormControl>
              <FormDescription>
                The directory in your filesystem where all of your astrophotos
                are stored as a backup. This is ideally on a cloud or a NAS.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />*/}
        <FormField
          control={form.control}
          name="sourceDirectory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source Directory (Optional)</FormLabel>
              <FormControl>
                <FileSelector
                  value={appState.local_config.source_directory}
                  disabled
                >
                  <DeleteButton
                    value={appState.local_config.source_directory}
                    path="local_config.source_directory"
                    saveAction={savePreferences}
                  />
                  <CopyButton
                    value={appState.local_config.source_directory}
                  />
                  <FileSelectorChangeButton
                    path="local_config.source_directory"
                    saveAction={savePreferences}
                    directory
                  />
                </FileSelector>
              </FormControl>
              <FormDescription>
                The default source directory of your new imaging sessions.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div></div>
      </form>
    </Form>
  );
}

function rootAction(
  value: string,
  appState: AppState,
  setAppState: React.Dispatch<React.SetStateAction<AppState>>,
  path: string,
): void {
  let origin = appState.local_config.root_directory;

  invoke('rename_directory', { origin: origin, destination: value }).catch(
    (error) => {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Error: ' + error,
      });
    },
  );
}

function backupAction(
  value: string,
  appState: AppState,
  setAppState: React.Dispatch<React.SetStateAction<AppState>>,
  path: string,
): void {
  const origin = '';

  if (origin != '') {
    invoke('rename_directory', { origin: origin, destination: value })
      .then(() => savePreferences(value, appState, setAppState, path))
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'Error: ' + error,
        });
      });

    return;
  }

  invoke('setup_backup', { path: value })
    .then(() => savePreferences(value, appState, setAppState, path))
    .catch((error) => {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Error: ' + error,
      });
    });
}
