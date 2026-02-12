'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CalibrationFrame } from '@/interfaces/state';
import { SortableHeader } from '@/components/ui/custom/tableHeader';

export const calibrationColumnsSimple: ColumnDef<CalibrationFrame>[] = [
  {
    accessorKey: 'camera',
    header: ({ column }) => (
      <SortableHeader column={column} title="Camera" />
    ),
  },
  {
    accessorKey: 'calibration_type',
    header: ({ column }) => (
      <SortableHeader column={column} title="Type" />
    ),
  },
  {
    accessorKey: 'gain',
    header: ({ column }) => (
      <SortableHeader column={column} title="Gain / ISO" />
    ),
  },
  {
    accessorKey: 'offset',
    header: ({ column }) => (
      <SortableHeader column={column} title="Offset" />
    ),
  },
  {
    accessorKey: 'binning',
    header: ({ column }) => (
      <SortableHeader column={column} title="Binning" />
    ),
  },
  {
    accessorKey: 'sub_length',
    header: ({ column }) => (
      <SortableHeader column={column} title="Sub Length" />
    ),
  },
  {
    accessorKey: 'camera_temp',
    header: ({ column }) => (
      <SortableHeader column={column} title="Temp (°C)" />
    ),
  },
  {
    accessorKey: 'total_subs',
    header: ({ column }) => (
      <SortableHeader column={column} title="Subs" />
    ),
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <SortableHeader column={column} title="Created" />
    ),
  },
];
