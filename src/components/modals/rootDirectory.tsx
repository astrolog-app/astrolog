'use client';

import { Modal } from '@/components/ui/custom/modal';
import { invoke } from '@tauri-apps/api/tauri';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import FileSelector, { FileSelectorChangeButton } from '@/components/fileSelectors/fileSelector';
import { useState } from 'react';
import { useModal } from '@/context/modalProvider';
import { fetchAppState, useAppState } from '@/context/stateProvider';

export default function RootDirectory() {
  const [value, setValue] = useState<string>('');

  const { closeModal } = useModal();
  const { setAppState } = useAppState();

  function updateAppState(): void {
    invoke('update_app_state_from_json')
      .then(() => {
        fetchAppState(setAppState);
      })
      .catch((e) => toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Error: ' + e
      }));
  }

  function onSubmit(): void {
    invoke('set_root_directory', { rootDirectory: value })
      .then(() => {
        toast({
          title: 'Success!',
          description: 'Your root directory has been saved.'
        });

        updateAppState();
        closeModal();
      })
      .catch((e) => toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Error: ' + e
      }));
  }

  return (
    <Modal
      title="Set Root Directory"
      notClosable
      className="w-96"
    >
      <FileSelector
        value={value}
        disabled
      >
        <FileSelectorChangeButton
          saveAction={(path) => setValue(path)}
          path=""
          directory
        />
      </FileSelector>
      <Button onClick={onSubmit}>xxx</Button>
    </Modal>
  );
}
