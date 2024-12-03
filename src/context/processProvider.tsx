'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { Process } from '@/interfaces/process';
import { UUID } from 'crypto';
import { toast } from '@/components/ui/use-toast';

type ProcessContextType = {
  processes: Map<UUID, Process>;
  // eslint-disable-next-line no-unused-vars
  startProcess: (invoke: () => Promise<unknown>) => Promise<unknown>;
};

const ProcessContext = createContext<ProcessContextType | undefined>(undefined);

export const ProcessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [processes, setProcesses] = useState<Map<UUID, Process>>(new Map());

  useEffect(() => {
    const unlisten = listen<Process>(
      'process',
      (event) => {
        setProcesses((prevProcesses) => {
          const updatedProcesses = new Map(prevProcesses);

          if (event.payload.max == event.payload.step) {
            updatedProcesses.delete(event.payload.id);

            if (event.payload.modal) {
              toast({
                description: 'Finished Process: ' + event.payload.name
              });
            }
          } else {
            updatedProcesses.set(event.payload.id, event.payload);
          }

          return updatedProcesses;
        });
      }
    );

    return () => {
      unlisten.then((dispose) => dispose());
    };
  }, []);

  const startProcess = async (invoke: () => Promise<unknown>): Promise<unknown> => {
    return await invoke();
  };

  return (
    <ProcessContext.Provider value={{ processes, startProcess }}>
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
