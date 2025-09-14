'use client';

import { Modal } from '@/components/ui/custom/modal';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import React, { useState } from 'react';
import { relaunch } from '@tauri-apps/plugin-process';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import UnitToggle from '@/components/ui/custom/unitToggle';
import { Unit } from '@/enums/unit';
import { Label } from '@/components/ui/label';

export default function SetupAstrolog() {
  const [unit, setUnit] = useState<Unit | undefined>(undefined);

  function onSubmit(): void {
    open({
      multiple: false,
      directory: true,
    })
      .then(async (selectedPath) => {
        if (selectedPath) {
          invoke('setup_astrolog', { unit: unit, rootDirectory: selectedPath })
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
    <Modal title="Setup Astrolog" notClosable className="w-[450px]" separator>
      <div className="space-y-4">
        <div className="space-y-3">
          <Label>Unit</Label>
          <div className="text-sm text-muted-foreground">
            Select the unit System for AstroLog.
          </div>
          <UnitToggle value={unit} onChange={setUnit} />
        </div>

        <div className="space-y-3">
          <Label className="mb-0">Root Directory</Label>
          <div className="text-sm text-muted-foreground">
            Select the root directory for AstroLog. This is where all your imaging sessions will be saved and accessed.
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            You cannot change the root directory after initialisation with the current version.
          </AlertDescription>
        </Alert>

        <Button onClick={onSubmit} disabled={unit == undefined} className="w-full mt-6">
          Select Directory
        </Button>
      </div>
    </Modal>
  );
}
