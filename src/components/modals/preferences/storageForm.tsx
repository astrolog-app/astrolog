'use client';

import styles from './preferences.module.scss';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { ToastAction } from '@/components/ui/toast';
import { toast, useToast } from '@/components/ui/use-toast';
import { AppState, savePreferences, useAppState } from '@/context/stateProvider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import FileSelector, { FileSelectorChangeButton } from '@/components/fileSelectors/fileSelector';
import { z } from 'zod';
import { invoke } from '@tauri-apps/api/tauri';
import React from 'react';
import { CopyButton, DeleteButton } from '@/components/ui/button';

const formSchema = z.object({
  rootDirectory: z.string().min(2, {
    message: 'Username must be at least 2 characters.' // change
  }),
  backupDirectory: z.string().min(2, {
    message: 'Username must be at least 2 characters.' // change
  }),
  sourceDirectory: z.string().min(2, {
    message: 'Username must be at least 2 characters.' // change
  })
});

export default function StorageForm() {
  const { toast } = useToast();
  const { appState } = useAppState();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rootDirectory: appState.preferences.storage.root_directory,
      backupDirectory: appState.preferences.storage.backup_directory,
      sourceDirectory: appState.preferences.storage.source_directory
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: 'Success',
      description: 'Your preferences have been saved.',
      action: (
        <ToastAction onClick={() => console.log('test')} altText="Undo">
          Undo
        </ToastAction>
      )
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
                  value={appState.preferences.storage.root_directory}
                  disabled
                >
                  <CopyButton
                    value={appState.preferences.storage.root_directory}
                  />
                  <FileSelectorChangeButton
                    path="preferences.storage.root_directory"
                    saveAction={(value, appState, setAppState, path) => rootAction(value, appState, setAppState, path)}
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
        <FormField
          control={form.control}
          name="backupDirectory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Backup Directory (Optional)</FormLabel>
              <FormControl>
                <FileSelector
                  value={appState.preferences.storage.backup_directory}
                  disabled
                >
                  <DeleteButton
                    value={appState.preferences.storage.backup_directory}
                    path="preferences.storage.backup_directory"
                    saveAction={savePreferences}
                  />
                  <CopyButton
                    value={appState.preferences.storage.backup_directory}
                  />
                  <FileSelectorChangeButton
                    path="preferences.storage.backup_directory"
                    saveAction={(value, appState, setAppState, path) => backupAction(value, appState, setAppState, path)}
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
        />
        <FormField
          control={form.control}
          name="sourceDirectory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source Directory (Optional)</FormLabel>
              <FormControl>
                <FileSelector
                  value={appState.preferences.storage.source_directory}
                  disabled
                >
                  <DeleteButton
                    value={appState.preferences.storage.source_directory}
                    path="preferences.storage.source_directory"
                    saveAction={savePreferences}
                  />
                  <CopyButton
                    value={appState.preferences.storage.source_directory}
                  />
                  <FileSelectorChangeButton
                    path="preferences.storage.source_directory"
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

async function rootAction(value: string, appState: AppState, setAppState: React.Dispatch<React.SetStateAction<AppState>>, path: string) {
  let origin = appState.preferences.storage.root_directory;
  if (origin != '') {
    try {
      await invoke('rename_directory', { origin: origin, destination: value });
    } catch (error) {
      const errorMsg = error as string;
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Error: ' + errorMsg
      });
    }
  } else {
    try {
      await invoke('check_meta_data_directory');
    } catch (error) {
      try {
        await invoke('create_dir', { path: value });
      } catch (error) {
        const errorMsg = error as string;
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'Error: ' + errorMsg
        });
      }
    }
  }
}

async function backupAction(value: string, appState: AppState, setAppState: React.Dispatch<React.SetStateAction<AppState>>, path: string) {
  let origin = appState.preferences.storage.backup_directory;
  if (origin != '') {
    if (await invoke('rename_directory', { origin: origin, destination: value })) {
      savePreferences(value, appState, setAppState, path);
    } else {
      // TODO: open toast
    }
  } else {
    if (await invoke('setup_backup', { path: value })) {
      savePreferences(value, appState, setAppState, path);
    }
  }
}
