'use client';

import { Modal } from '@/components/ui/custom/modal';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import React from 'react';
import { relaunch } from '@tauri-apps/plugin-process';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';

export default function RootDirectory() {
  function onSubmit(): void {
    open({
      multiple: false,
      directory: true,
    })
      .then(async (selectedPath) => {
        if (selectedPath) {
          invoke('set_root_directory', { rootDirectory: selectedPath })
            .then(() => void relaunch())
            .catch((e) =>
              toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: 'Error: ' + e
              })
            );
        }
      })
  }

  return (
    <Modal title="Set Root Directory" notClosable className="w-[450px]" separator>
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Select the root directory for AstroLog. This is where all your imaging sessions will be saved and accessed.
        </div>

        <Alert variant='destructive'>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            You cannot change the root directory after initialisation with the current version.
          </AlertDescription>
        </Alert>

        <Button onClick={onSubmit} className="w-full mt-2">
          Select Directory
        </Button>
      </div>
    </Modal>
  );
}
