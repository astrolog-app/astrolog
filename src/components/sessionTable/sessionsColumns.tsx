'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '../ui/button';
import { ArrowUpDown } from 'lucide-react';
import { ImagingSession } from '@/interfaces/state';

export const sessionsColumns: ColumnDef<ImagingSession>[] = [
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
    accessorKey: 'integrated_subs',
    header: 'Integrated Subs',
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
    header: 'Outside Temp',
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
