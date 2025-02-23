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
import { UUID } from 'crypto';
import { EquipmentItem } from '@/interfaces/equipment';

interface EquipmentComboBoxProps {
  type: EquipmentType;
  value: UUID;
  // eslint-disable-next-line no-unused-vars
  onChange: (value: UUID) => void;
}

export default function EquipmentComboBox({
                                            type,
                                            value,
                                            onChange,
                                          }: EquipmentComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const { appState } = useAppState();
  const title: string = type.toString();

  useEffect(() => {
    switch (type) {
      case EquipmentType.CAMERA:
        setItems(Array.from(appState.equipment_list.cameras.values()));
        break;
      case EquipmentType.TELESCOPE:
        setItems(Array.from(appState.equipment_list.telescopes.values()));
        break;
      case EquipmentType.MOUNT:
        setItems(Array.from(appState.equipment_list.mounts.values()));
        break;
      case EquipmentType.FILTER:
        setItems(Array.from(appState.equipment_list.filters.values()));
        break;
      case EquipmentType.FLATTENER:
        setItems(Array.from(appState.equipment_list.flatteners.values()));
        break;
    }
  }, [
    appState.equipment_list.cameras,
    appState.equipment_list.filters,
    appState.equipment_list.flatteners,
    appState.equipment_list.mounts,
    appState.equipment_list.telescopes,
    type,
  ]);

  const selectedItem = items.find((item) => item.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedItem ? getViewName(selectedItem) : `Select ${title}...`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder={`Search ${title}...`} />
          <CommandList>
            <CommandEmpty>No values found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={(currentValue) => {
                    onChange(currentValue as UUID);
                    console.log(currentValue)
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === item.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {getViewName(item)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
