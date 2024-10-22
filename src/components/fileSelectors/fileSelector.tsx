import { Input } from '../ui/input';
import { Button, ButtonProps } from '../ui/button';
import styles from './fileSelector.module.scss';
import { DialogFilter, open } from '@tauri-apps/api/dialog';
import { toast } from '../ui/use-toast';
import { useAppState } from '@/context/stateProvider';
import { AppState } from '@/interfaces/state';
import { Dispatch, ReactNode, SetStateAction } from 'react';

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
}

export function   FileSelectorChangeButton({
  path,
  saveAction,
  directory,
  filters,
  ...props
}: FileSelectorChangeButtonProps) {
  const { appState, setAppState } = useAppState();

  function onClick() {
    open({
      multiple: false,
      directory: directory,
      filters: filters
    })
      .then((selectedPath) => {
        if (selectedPath) {
          saveAction(selectedPath as string, appState, setAppState, path);
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
    <Button {...props} type="button" onClick={onClick}>
      Change
    </Button>
  );
}
