'use client';

import { Input } from '../ui/input';
import { Button, ButtonProps } from '../ui/button';
import styles from './fileSelector.module.scss';
import { DialogFilter, open } from '@tauri-apps/plugin-dialog';
import { toast } from '../ui/use-toast';
import { useAppState } from '@/context/stateProvider';
import { AppState } from '@/interfaces/state';
import { Dispatch, ReactNode, SetStateAction } from 'react';
import { ask } from '@tauri-apps/plugin-dialog';

interface OptionInputProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  children: ReactNode;
}

export default function FileSelector({
  value,
  placeholder,
  disabled,
  children,
}: OptionInputProps) {
  return (
    <div className={styles.input}>
      <Input value={value} placeholder={placeholder} disabled={disabled} />
      {children}
    </div>
  );
}

interface FileSelectorChangeButtonProps extends ButtonProps {
  saveAction: (
    value: string,
    appState: AppState,
    setAppState: Dispatch<SetStateAction<AppState>>,
    path: string,
  ) => void;
  path: string;
  directory?: boolean,
  filters?: DialogFilter[],
  name?: string;
  confirmDialog?: boolean;
  confirmMessage?: string;
}

export function   FileSelectorChangeButton({
  path,
  saveAction,
  directory,
  filters,
  name = "Change",
  confirmDialog = false,
  confirmMessage = "Are you sure you want to continue?",
  ...props
}: FileSelectorChangeButtonProps) {
  const { appState, setAppState } = useAppState();

  function onClick() {
    open({
      multiple: false,
      directory: directory,
      filters: filters
    })
      .then(async (selectedPath) => {
        if (selectedPath) {
          const confirmed = !confirmDialog || await ask('Are you sure?', 'Tauri');
          if (confirmed) {
            saveAction(selectedPath as string, appState, setAppState, path);
          }
        }
      })
      .catch((err) => {
        toast({
          variant: 'destructive',
          description: 'Failed to open folder: ' + err,
        });
        console.log(err);
      });
  }

  return (
    <Button {...props} type="button" onClick={onClick} className="w-28">
      {name}
    </Button>
  );
}
