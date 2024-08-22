import React, { useEffect, useState } from 'react';
import { Input } from './../input';
import { Button, ButtonProps } from './../button';
import styles from './optionInput.module.scss';
import { DialogFilter, open, OpenDialogOptions } from '@tauri-apps/api/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '../use-toast';
import { AppState, useAppState } from '@/context/stateProvider';
import { copySVG, deleteSVG } from '@/app/svgs';

interface OptionInputProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export default function OptionInput({
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

export function OptionInputCopy({ value }: { value: string }) {
  const [selectable, setSelectable] = useState<boolean>(false);

  useEffect(() => {
    if (value === '') {
      setSelectable(true);
    } else {
      setSelectable(false);
    }
  }, [value]);

  function onClick() {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        toast({
          description: 'Copied to clipboard.',
        });
      })
      .catch((err) => {
        toast({
          variant: 'destructive',
          description: 'Failed to copy to clipboard: ' + err,
        });
      });
  }

  return (
    <TooltipProvider>
      <div>
        <Tooltip>
          <TooltipTrigger type="button" asChild>
            <Button
              disabled={selectable}
              type="button"
              size={'icon'}
              variant={'outline'}
              onClick={onClick}
              svg={true}
            >
              {copySVG}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy to clipboard</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

interface ChangeButtonProps extends ButtonProps {
  saveAction: (
    value: string,
    appState: AppState,
    setAppState: React.Dispatch<React.SetStateAction<AppState>>,
    path: string,
  ) => void;
  path: string;
  directory?: boolean,
  filters?: DialogFilter[],
}

export function ChangeButton({
  path,
  saveAction,
  directory,
  filters,
  ...props
}: ChangeButtonProps) {
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

interface DeleteButtonProps {
  value: string;
  saveAction: (
    value: string,
    appState: AppState,
    setAppState: React.Dispatch<React.SetStateAction<AppState>>,
    path: string,
  ) => void;
  path: string;
}

export function DeleteButton({ value, saveAction, path }: DeleteButtonProps) {
  const { appState, setAppState } = useAppState();
  const [selectable, setSelectable] = useState<boolean>(false);

  useEffect(() => {
    if (value === '') {
      setSelectable(true);
    } else {
      setSelectable(false);
    }
  }, [value]);

  function onClick() {
    saveAction('', appState, setAppState, path);
  }

  return (
    <TooltipProvider>
      <div>
        <Tooltip>
          <TooltipTrigger type="button" asChild>
            <Button
              disabled={selectable}
              type="button"
              size={'icon'}
              variant={'outline'}
              onClick={onClick}
              svg={true}
            >
              {deleteSVG}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
