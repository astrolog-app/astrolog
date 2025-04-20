'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/utils/classNames';
import { EquipmentType } from '@/enums/equipmentType';
import { useAppState } from '@/context/stateProvider';
import { getViewName } from '@/utils/equipment';
import { UUID } from 'crypto';
import { EquipmentItem } from '@/interfaces/equipment';
import { CalibrationType } from '@/enums/calibrationType';

interface ComboBoxPros {
  value: UUID | undefined;
  // eslint-disable-next-line no-unused-vars
  onChange: (value: UUID | undefined) => void;
}

interface DefaultComboBoxProps extends ComboBoxPros {
  values: ComboBoxValue[];
  placeholder: string;
  nullItem: boolean;
  placeFirst: boolean;
}

interface ComboBoxValue {
  id: UUID | undefined;
  name: string;
}

function ComboBox({ 
                    value,
                    onChange,
                    values,
                    placeholder,
                    nullItem,
                    placeFirst
                  }: DefaultComboBoxProps) {
  const [open, setOpen] = useState(false);

  const finalValues = useMemo(() => {
    return nullItem
      ? [{ id: undefined, name: "None" }, ...values]
      : values;
  }, [nullItem, values]);

  useEffect(() => {
    if (placeFirst && !value && finalValues.length === 1) {
      onChange(finalValues[0].id);
    }
  }, [onChange, finalValues, value, placeFirst]);

  const selectedName = finalValues.find((boxValue) => boxValue.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedName ? selectedName.name : `Select ${placeholder}...`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder={`Search ${placeholder}...`} />
          <CommandList>
            <CommandEmpty>No values found.</CommandEmpty>
            <CommandGroup>
              {finalValues.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={(currentValue) => {
                    onChange(currentValue as UUID);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === item.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface EquipmentComboBoxProps extends ComboBoxPros{
  type: EquipmentType;
}

export function EquipmentComboBox({
                                            type,
                                            value,
                                            onChange
                                          }: EquipmentComboBoxProps) {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [nullItem, setNullItem] = useState<boolean>(false);
  const { appState } = useAppState();

  useEffect(() => {
    switch (type) {
      case EquipmentType.CAMERA:
        setItems(Array.from(appState.equipment_list.cameras.values()));
        setNullItem(false);
        break;
      case EquipmentType.TELESCOPE:
        setItems(Array.from(appState.equipment_list.telescopes.values()));
        setNullItem(false);
        break;
      case EquipmentType.MOUNT:
        setItems(Array.from(appState.equipment_list.mounts.values()));
        setNullItem(false);
        break;
      case EquipmentType.FILTER:
        setItems(Array.from(appState.equipment_list.filters.values()));
        setNullItem(true);
        break;
      case EquipmentType.FLATTENER:
        setItems(Array.from(appState.equipment_list.flatteners.values()));
        setNullItem(true);
        break;
    }
  }, [
    appState.equipment_list.cameras,
    appState.equipment_list.filters,
    appState.equipment_list.flatteners,
    appState.equipment_list.mounts,
    appState.equipment_list.telescopes,
    type
  ]);

  const values: ComboBoxValue[] = items.map(item => ({
    id: item.id,
    name: getViewName(item)
  }));

  return (
    <ComboBox
      value={value}
      onChange={onChange}
      values={values}
      placeholder={type.toString()}
      nullItem={nullItem}
      placeFirst={true}
    />
  );
}

export function LocationComboBox({ value, onChange }: ComboBoxPros) {
  const { appState } = useAppState();

  const [values, setValues] = useState<ComboBoxValue[]>([]);

  useEffect(() => {
    const locations = Array.from(appState.config.locations.values());

    const newValues: ComboBoxValue[] = locations.map(loc => ({
      id: loc.id,
      name: loc.name,
    }));

    setValues(newValues)
  }, [appState.config.locations]);

  return (
    <ComboBox
      value={value}
      onChange={onChange}
      values={values}
      placeholder="Location"
      nullItem={false}
      placeFirst={true}
    />
  );
}

export function BiasFrameComboBox({ value, onChange }: ComboBoxPros) {
  const { appState } = useAppState();

  const biasFrames = Array.from(appState.table_data.calibration).filter(frame => frame.calibration_type === CalibrationType.BIAS);

  const values: ComboBoxValue[] = biasFrames.map(frame => ({
    id: frame.id,
    name: frame.camera + " " + frame.gain,
  }));

  return (
    <ComboBox
      value={value}
      onChange={onChange}
      values={values}
      placeholder="Bias Frames"
      nullItem={true}
      placeFirst={false}
    />
  );
}

export function DarkFrameComboBox({ value, onChange }: ComboBoxPros) {
  const { appState } = useAppState();

  const darkFrames = Array.from(appState.table_data.calibration).filter(frame => frame.calibration_type === CalibrationType.DARK);

  const values: ComboBoxValue[] = darkFrames.map(frame => ({
    id: frame.id,
    name: frame.camera + " " + frame.gain,
  }));

  return (
    <ComboBox
      value={value}
      onChange={onChange}
      values={values}
      placeholder="Dark Frames"
      nullItem={true}
      placeFirst={false}
    />
  );
}
