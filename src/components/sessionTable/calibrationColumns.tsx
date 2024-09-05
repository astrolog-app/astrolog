'use client';

import { ColumnDef } from '@tanstack/react-table';
import { UUID } from 'crypto';
import { Calibration } from '@/context/stateProvider';

export const calibrationColumns: ColumnDef<Calibration>[] = [
  {
    accessorKey: 'camera',
    header: 'Camera',
  },
  {
    accessorKey: 'calibration_type',
    header: 'Calibration Type',
  },
  {
    accessorKey: 'gain',
    header: 'Gain',
  },
  {
    accessorKey: 'sub_length',
    header: 'Sub Length',
  },
  {
    accessorKey: 'camera_temp',
    header: 'Camera Temp',
  },
  {
    accessorKey: 'total_subs',
    header: 'Total Subs',
  }
];
