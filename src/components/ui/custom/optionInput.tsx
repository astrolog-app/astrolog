import React, { useEffect, useState } from 'react';
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
  const [selectable, setSelectable] = useState<boolean>(false);

  useEffect(() => {
    if (value === "") {
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

interface DeleteButtonProps {
  value: string;
  saveAction: (
    appState: AppState,
    setAppState: React.Dispatch<React.SetStateAction<AppState>>,
    value: string,
    path: string,
  ) => void;
  path: string;
}

export function DeleteButton({ value, saveAction, path }: DeleteButtonProps) {
  const { appState, setAppState } = useAppState();
  const [selectable, setSelectable] = useState<boolean>(false);

  useEffect(() => {
    if (value === "") {
      setSelectable(true);
    } else {
      setSelectable(false);
    }
  }, [value]);

  function onClick() {
    saveAction(appState, setAppState, "", path);
  }

  return (
    <TooltipProvider>
      <div>
        <Tooltip>
          <TooltipTrigger type="button" asChild>
            <Button disabled={selectable}
              type="button"
              size={'icon'}
              variant={'outline'}
              className={styles.svgButton}
              onClick={onClick}
            >
              <svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 482.428 482.429">
                <g>
                  <g>
                    <path d="M381.163,57.799h-75.094C302.323,25.316,274.686,0,241.214,0c-33.471,0-61.104,25.315-64.85,57.799h-75.098
			c-30.39,0-55.111,24.728-55.111,55.117v2.828c0,23.223,14.46,43.1,34.83,51.199v260.369c0,30.39,24.724,55.117,55.112,55.117
			h210.236c30.389,0,55.111-24.729,55.111-55.117V166.944c20.369-8.1,34.83-27.977,34.83-51.199v-2.828
			C436.274,82.527,411.551,57.799,381.163,57.799z M241.214,26.139c19.037,0,34.927,13.645,38.443,31.66h-76.879
			C206.293,39.783,222.184,26.139,241.214,26.139z M375.305,427.312c0,15.978-13,28.979-28.973,28.979H136.096
			c-15.973,0-28.973-13.002-28.973-28.979V170.861h268.182V427.312z M410.135,115.744c0,15.978-13,28.979-28.973,28.979H101.266
			c-15.973,0-28.973-13.001-28.973-28.979v-2.828c0-15.978,13-28.979,28.973-28.979h279.897c15.973,0,28.973,13.001,28.973,28.979
			V115.744z"/>
                    <path d="M171.144,422.863c7.218,0,13.069-5.853,13.069-13.068V262.641c0-7.216-5.852-13.07-13.069-13.07
			c-7.217,0-13.069,5.854-13.069,13.07v147.154C158.074,417.012,163.926,422.863,171.144,422.863z"/>
                    <path d="M241.214,422.863c7.218,0,13.07-5.853,13.07-13.068V262.641c0-7.216-5.854-13.07-13.07-13.07
			c-7.217,0-13.069,5.854-13.069,13.07v147.154C228.145,417.012,233.996,422.863,241.214,422.863z"/>
                    <path d="M311.284,422.863c7.217,0,13.068-5.853,13.068-13.068V262.641c0-7.216-5.852-13.07-13.068-13.07
			c-7.219,0-13.07,5.854-13.07,13.07v147.154C298.213,417.012,304.067,422.863,311.284,422.863z"/>
                  </g>
                </g>
              </svg>
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
