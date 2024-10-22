'use client';

import { Modal } from '@/components/ui/custom/modal';
import { invoke } from '@tauri-apps/api/tauri';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import FileSelector, { FileSelectorChangeButton } from '@/components/fileSelectors/fileSelector';
import { useState } from 'react';

export default function RootDirectory() {
  const [value, setValue] = useState<string>('');

  function onClick() {
    invoke("set_root_directory", { rootDirectory: value })
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
      separator
      className='w-96'
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
      <Button onClick={onClick}>xxx</Button>
    </Modal>
  );
}
