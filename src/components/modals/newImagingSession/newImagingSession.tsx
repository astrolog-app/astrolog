'use client';

import styles from './newImagingSession.module.scss';
import { Modal } from '@/components/ui/custom/modal';
import OptionInput, { ChangeButton } from '@/components/ui/custom/optionInput';
import { AppState, useAppState } from '@/context/stateProvider';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export default function NewImagingSession({
  onClose,
}: {
  onClose: () => void;
}) {
  const { appState } = useAppState();
  const [value, setValue] = useState<string>(
    appState.preferences.storage.source_directory,
  );
  const [buttonEnabled, setButtonEnabled] = useState<boolean>(value !== '');

  function changeValue(
    appState: AppState,
    setAppState: Dispatch<SetStateAction<AppState>>,
    value: string,
    path: string,
  ) {
    setValue(value);
  }

  function detectImagingSessions() {
    invoke('detect_imaging_sessions', { path: value });
  }

  const formSchema = z.object({
    path: z.string().min(1, {
      message: 'Path must be at least a character long.',
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      path: value,
    },
  });

  useEffect(() => {
    setButtonEnabled(value !== '');
  }, [value]);

  return (
    <Modal
      onClose={onClose}
      title="Add Imaging Session"
      separator
      className={styles.modal}
    >
      <Form {...form}>
        <FormField
          control={form.control}
          name="path"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source Directory</FormLabel>
              <FormControl>
                <OptionInput value={value} disabled>
                  <ChangeButton
                    saveAction={changeValue}
                    path=""
                    variant="secondary"
                  />
                </OptionInput>
              </FormControl>
              <FormDescription>
                The directory of your new imaging session(s).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className={styles.submitButton}
          disabled={!buttonEnabled}
          onClick={detectImagingSessions}
          type="submit"
        >
          Detect Imaging Sessions
        </Button>
      </Form>
    </Modal>
  );
}
