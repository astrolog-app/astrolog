'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '../../ui/button';
import { ArrowUpDown } from 'lucide-react';
import { ImagingSession } from '@/interfaces/state';

export const sessionsColumnsSimple: ColumnDef<ImagingSession>[] = [
  {
    accessorKey: 'date',
    header: 'Date',
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
    header: 'Target',
  },
  {
    header: 'Location',
    cell: ({ row }) => `${row.original.telescope}, ${row.original.camera}, ${row.original.filter}`,
  },
  {
    header: 'Equipment',
    cell: ({ row }) => `${row.original.telescope}, ${row.original.camera}, ${row.original.filter}`,
  },
  {
    header: 'Exposure',
    cell: ({ row }) => `${row.original.total_subs} x ${row.original.sub_length}s`,
  }
];
