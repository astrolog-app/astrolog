'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { Process } from '@/interfaces/process';
import { UUID } from 'crypto';
import { toast } from '@/components/ui/use-toast';
import { invoke } from '@tauri-apps/api/core';
import { message } from '@tauri-apps/plugin-dialog';

type ProcessContextType = {
  processes: Map<UUID, Process>;
};

const ProcessContext = createContext<ProcessContextType | undefined>(undefined);

export const ProcessProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [processes, setProcesses] = useState<Map<UUID, Process>>(new Map());
  const [closeLock, setCloseLock] = useState<boolean>(false);

  useEffect(() => {
    const unlisten = listen<Process>('process', (event) => {
      setProcesses((prevProcesses) => {
        const updatedProcesses = new Map(prevProcesses);

        if (event.payload.finished) {
          updatedProcesses.delete(event.payload.id);

          if (event.payload.error !== null) {
            toast({
              variant: 'destructive',
              title: 'Uh oh! Something went wrong.',
              description: 'Process killed: ' + event.payload.name + ";\nError: " + event.payload.error,
            });
          } else if (event.payload.modal) {
            toast({
              description: 'Finished Process: ' + event.payload.name,
            });
          }
        } else {
          updatedProcesses.set(event.payload.id, event.payload);
        }

        return updatedProcesses;
      });
    });

    return () => {
      unlisten.then((dispose) => dispose());
    };
  }, []);

  useEffect(() => {
    void listen('close_lock', () => {
      message("Can't close AstroLog: There are still ongoing processes!").catch(
        (error) => {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: 'Error: ' + error,
          });
        },
      );
    });
  }, []);

  useEffect(() => {
    if (processes.size > 0 && !closeLock) {
      invoke('add_close_lock')
        .then(() => setCloseLock(true))
        .catch((error) => {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: 'Error: ' + error,
          });
        });
    }

    if (processes.size == 0) {
      invoke('remove_close_lock')
        .then(() => setCloseLock(false))
        .catch((error) => {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: 'Error: ' + error,
          });
        });
    }
  }, [closeLock, processes]);

  return (
    <ProcessContext.Provider value={{ processes }}>
      {children}
    </ProcessContext.Provider>
  );
};

export const useProcess = () => {
  const context = useContext(ProcessContext);
  if (!context) {
    throw new Error('useProcess must be used within a ProcessProvider');
  }
  return context;
};
