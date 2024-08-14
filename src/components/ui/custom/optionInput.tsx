import React from 'react';
import { Input } from './../input';
import { Button } from './../button';
import styles from './optionInput.module.scss';
import { open } from '@tauri-apps/api/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '../use-toast';
import { AppState, useAppState } from '@/context/stateProvider';

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
              type="button"
              size={'icon'}
              variant={'outline'}
              className={styles.svgButton}
              onClick={onClick}
            >
              <svg
                version="1.1"
                id="Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 210.107 210.107"
              >
                <g>
                  <path
                    d="M168.506,0H80.235C67.413,0,56.981,10.432,56.981,23.254v2.854h-15.38
		c-12.822,0-23.254,10.432-23.254,23.254v137.492c0,12.822,10.432,23.254,23.254,23.254h88.271
		c12.822,0,23.253-10.432,23.253-23.254V184h15.38c12.822,0,23.254-10.432,23.254-23.254V23.254C191.76,10.432,181.328,0,168.506,0z
		 M138.126,186.854c0,4.551-3.703,8.254-8.253,8.254H41.601c-4.551,0-8.254-3.703-8.254-8.254V49.361
		c0-4.551,3.703-8.254,8.254-8.254h88.271c4.551,0,8.253,3.703,8.253,8.254V186.854z M176.76,160.746
		c0,4.551-3.703,8.254-8.254,8.254h-15.38V49.361c0-12.822-10.432-23.254-23.253-23.254H71.981v-2.854
		c0-4.551,3.703-8.254,8.254-8.254h88.271c4.551,0,8.254,3.703,8.254,8.254V160.746z"
                  />
                </g>
              </svg>
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

interface ChangeButtonProps {
  saveAction: (
    appState: AppState,
    setAppState: React.Dispatch<React.SetStateAction<AppState>>,
    value: string,
    path: string,
  ) => void;
  path: string;
}

export function ChangeButton({ path, saveAction }: ChangeButtonProps) {
  const { appState, setAppState } = useAppState();

  function onClick() {
    open({
      directory: true,
      multiple: false,
    })
      .then((selectedPath) => {
        if (selectedPath) {
          saveAction(appState, setAppState, selectedPath as string, path);
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
    <Button type="button" onClick={onClick}>
      Change
    </Button>
  );
}
