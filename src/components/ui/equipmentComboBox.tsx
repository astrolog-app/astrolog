'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/utils/classNames';
import { EquipmentType } from '@/enums/equipmentType';
import { useAppState } from '@/context/stateProvider';
import { getViewName } from '@/utils/equipment';

interface ComboBoxProps {
  type: EquipmentType;
  value: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (value: string) => void;
}

export default function EquipmentComboBox({
  type,
  value,
  onChange,
}: ComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = useState<string[]>([]);

  const title: string = type.toString();
  const { appState } = useAppState();

  useEffect(() => {
    switch (type) {
      case EquipmentType.CAMERA:
        setValues(
          appState.equipment_list.camera_list.map((c) => getViewName(c)),
        );
        break;
      case EquipmentType.TELESCOPE:
        setValues(
          appState.equipment_list.telescope_list.map((c) => getViewName(c)),
        );
        break;
      case EquipmentType.MOUNT:
        setValues(
          appState.equipment_list.mount_list.map((c) => getViewName(c)),
        );
        break;
      case EquipmentType.FILTER:
        setValues(
          appState.equipment_list.filter_list.map((c) => getViewName(c)),
        );
        break;
      case EquipmentType.FLATTENER:
        setValues(
          appState.equipment_list.flattener_list.map((c) => getViewName(c)),
        );
        break;
    }
  }, [
    appState.equipment_list.camera_list,
    appState.equipment_list.filter_list,
    appState.equipment_list.flattener_list,
    appState.equipment_list.mount_list,
    appState.equipment_list.telescope_list,
    type,
  ]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? values.find((s) => s === value) : 'Select ' + title + '...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder={'Search ' + title + '...'} />
          <CommandList>
            <CommandEmpty>No values found.</CommandEmpty>
            <CommandGroup>
              {values.map((s) => (
                <CommandItem
                  key={s}
                  value={s}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === s ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {s}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
