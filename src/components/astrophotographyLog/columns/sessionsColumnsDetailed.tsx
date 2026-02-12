'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ImagingSession } from '@/interfaces/state';
import { TempCell } from '@/components/ui/custom/units';
import { SortableHeader, UnitsHeader } from '@/components/ui/custom/tableHeader';

const TEMP_UNITS = { metric: "°C", imperial: "°F" } as const;

export const sessionsColumnsDetailed: ColumnDef<ImagingSession>[] = [
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <SortableHeader column={column} title="Date" />
    ),
    cell: ({ getValue }) => {
      const rawValue = getValue() as string;
      const date = new Date(rawValue);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return <div>{`${day}.${month}.${year}`}</div>;
    },
  },
  {
    accessorKey: 'target',
    header: ({ column }) => (
      <SortableHeader column={column} title="Target" />
    ),
  },
  {
    accessorKey: 'sub_length',
    header: ({ column }) => (
      <SortableHeader column={column} title="Sub Length" />
    ),
  },
  {
    accessorKey: 'total_subs',
    header: ({ column }) => (
      <SortableHeader column={column} title="Total Subs" />
    ),
  },
  {
    accessorKey: 'filter',
    header: ({ column }) => (
      <SortableHeader column={column} title="Filter" />
    ),
  },
  {
    accessorKey: 'gain',
    header: ({ column }) => (
      <SortableHeader column={column} title="Gain / ISO" />
    ),
  },
  {
    accessorKey: 'binning',
    header: ({ column }) => (
      <SortableHeader column={column} title="Binning" />
    ),
  },
  {
    accessorKey: 'offset',
    header: ({ column }) => (
      <SortableHeader column={column} title="Offset" />
    ),
  },
  {
    accessorKey: 'camera_temp',
    header: ({ column }) => (
      <SortableHeader column={column} title="Camera Temp" />
    ),
  },
  {
    accessorKey: 'outside_temp',
    header: ({ column }) => (
      <UnitsHeader
        column={column}
        title="Outside Temp"
        unitCfg={TEMP_UNITS}
      />
    ),
    cell: ({ getValue }) => (
      <TempCell
        celsius={getValue<number | undefined>()}
        columnUnits={TEMP_UNITS}
      />
    ),
  },
  {
    accessorKey: 'average_seeing',
    header: ({ column }) => (
      <SortableHeader column={column} title="Average Seeing" />
    ),
  },
  {
    accessorKey: 'average_cloud_cover',
    header: ({ column }) => (
      <SortableHeader column={column} title="Average Cloud Cover" />
    ),
  },
  {
    accessorKey: 'average_moon',
    header: ({ column }) => (
      <SortableHeader column={column} title="Average Moon" />
    ),
  },
  {
    accessorKey: 'telescope',
    header: ({ column }) => (
      <SortableHeader column={column} title="Telescope" />
    ),
  },
  {
    accessorKey: 'flattener',
    header: ({ column }) => (
      <SortableHeader column={column} title="Flattener" />
    ),
  },
  {
    accessorKey: 'mount',
    header: ({ column }) => (
      <SortableHeader column={column} title="Mount" />
    ),
  },
  {
    accessorKey: 'camera',
    header: ({ column }) => (
      <SortableHeader column={column} title="Camera" />
    ),
  },
  {
    accessorKey: 'notes',
    header: ({ column }) => (
      <SortableHeader column={column} title="Notes" />
    ),
  },
];
