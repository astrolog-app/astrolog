'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CalibrationFrame } from '@/interfaces/state';
import { SortableHeader } from '@/components/ui/custom/tableHeader';

export const calibrationColumnsDetailed: ColumnDef<CalibrationFrame>[] = [
  {
    accessorKey: 'camera',
    header: ({ column }) => (
      <SortableHeader column={column} title="Camera" />
    ),
  },
  {
    accessorKey: 'calibration_type',
    header: ({ column }) => (
      <SortableHeader column={column} title="Calibration Type" />
    ),
  },
  {
    accessorKey: 'gain',
    header: ({ column }) => (
      <SortableHeader column={column} title="Gain" />
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
      <SortableHeader column={column} title="Camera Temp" />
    ),
  },
  {
    accessorKey: 'total_subs',
    header: ({ column }) => (
      <SortableHeader column={column} title="Total Subs" />
    ),
  },
];