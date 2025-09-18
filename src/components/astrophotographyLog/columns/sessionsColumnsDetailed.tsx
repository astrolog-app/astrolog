'use client';

import { Column, ColumnDef } from '@tanstack/react-table';
import { Button } from '../../ui/button';
import { ArrowUpDown } from 'lucide-react';
import { ImagingSession } from '@/interfaces/state';
import { DualUnit, TempCell, useUnit } from '@/components/ui/custom/units';

const TEMP_UNITS = { metric: "°C", imperial: "°F" } as const;


// TODO: separate
type UnitsHeaderProps<TData, TUnit extends string> = {
  column: Column<TData, unknown>;
  title: string;
  unitCfg: DualUnit<TUnit>;
};

export function UnitsHeader<TData, TUnit extends string>({
                                                           column,
                                                           title,
                                                           unitCfg,
                                                         }: UnitsHeaderProps<TData, TUnit>) {
  const unit = useUnit(unitCfg);
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title} [{unit}]
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}
// -----------

export const sessionsColumnsDetailed: ColumnDef<ImagingSession>[] = [
  {
    accessorKey: 'date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const rawValue = getValue() as string;
      const date = new Date(rawValue);
      // Ensure day and month have leading zeros
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const formattedDate = `${day}.${month}.${year}`;

      return (
        <div>
          {formattedDate}
        </div>
      );
    },
  },
  {
    accessorKey: 'target',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Target
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'sub_length',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Sub Length
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'total_subs',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Subs
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'filter',
    header: 'Filter',
  },
  {
    accessorKey: 'gain',
    header: 'Gain',
  },
  {
    accessorKey: 'offset',
    header: 'Offset',
  },
  {
    accessorKey: 'camera_temp',
    header: 'Camera Temp',
  },
  {
    accessorKey: 'outside_temp',
    header: ({ column }) => (
      <UnitsHeader column={column} title="Outside Temp" unitCfg={TEMP_UNITS} />
    ),
    cell: ({ getValue }) => <TempCell celsius={getValue<number | undefined>()} columnUnits={TEMP_UNITS} />
  },
  {
    accessorKey: 'average_seeing',
    header: 'Average Seeing',
  },
  {
    accessorKey: 'average_cloud_cover',
    header: 'Average Cloud Cover',
  },
  {
    accessorKey: 'average_moon',
    header: 'Average Moon',
  },
  {
    accessorKey: 'telescope',
    header: 'Telescope',
  },
  {
    accessorKey: 'flattener',
    header: 'Flattener',
  },
  {
    accessorKey: 'mount',
    header: 'Mount',
  },
  {
    accessorKey: 'camera',
    header: 'Camera',
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
  },
];
