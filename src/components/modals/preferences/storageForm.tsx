'use client'

import styles from './preferences.module.scss';
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
import { useToast } from '@/components/ui/use-toast';
import { AppState, savePreferences, useAppState } from '@/context/stateProvider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import OptionInput, {
  ChangeButton,
  DeleteButton,
  OptionInputCopy,
} from '@/components/ui/custom/optionInput';
import { z } from 'zod';
import { invoke } from '@tauri-apps/api/tauri';
import React from 'react';

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

export default function StorageForm() {
  const { toast } = useToast();
  const { appState } = useAppState();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rootDirectory: appState.preferences.storage.root_directory,
      backupDirectory: appState.preferences.storage.backup_directory,
      sourceDirectory: appState.preferences.storage.source_directory,
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
                <OptionInput
                  value={appState.preferences.storage.root_directory}
                  disabled
                >
                  <OptionInputCopy
                    value={appState.preferences.storage.root_directory}
                  />
                  <ChangeButton
                    path="preferences.storage.root_directory"
                    saveAction={(value, appState, setAppState, path) => moveDir(value, appState, setAppState, path, appState.preferences.storage.root_directory)}
                    directory
                  />
                </OptionInput>
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
                <OptionInput
                  value={appState.preferences.storage.backup_directory}
                  disabled
                >
                  <DeleteButton
                    value={appState.preferences.storage.backup_directory}
                    path="preferences.storage.backup_directory"
                    saveAction={savePreferences}
                  />
                  <OptionInputCopy
                    value={appState.preferences.storage.backup_directory}
                  />
                  <ChangeButton
                    path="preferences.storage.backup_directory"
                    saveAction={(value, appState, setAppState, path) => moveDir(value, appState, setAppState, path, appState.preferences.storage.backup_directory)}
                    directory
                  />
                </OptionInput>
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
                <OptionInput
                  value={appState.preferences.storage.source_directory}
                  disabled
                >
                  <DeleteButton
                    value={appState.preferences.storage.source_directory}
                    path="preferences.storage.source_directory"
                    saveAction={savePreferences}
                  />
                  <OptionInputCopy
                    value={appState.preferences.storage.source_directory}
                  />
                  <ChangeButton
                    path="preferences.storage.source_directory"
                    saveAction={savePreferences}
                    directory
                  />
                </OptionInput>
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

async function moveDir(value: string, appState: AppState, setAppState: React.Dispatch<React.SetStateAction<AppState>>, path: string, origin: string) {
  if (origin != "") {
    if (await invoke("rename_directory", { origin: origin, destination: value })) {
      savePreferences(value, appState, setAppState, path);
    }
  }
}
