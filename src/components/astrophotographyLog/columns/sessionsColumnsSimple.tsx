'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Calendar, Camera, Clock, MapPin, Moon } from 'lucide-react';
import { ImagingSession } from '@/interfaces/state';

export const sessionsColumnsSimple: ColumnDef<ImagingSession>[] = [
  {
    id: "date",
    accessorFn: (row) => new Date(row.date),
    header: "Date",
    cell: ({ getValue }) => {
      const date = getValue() as Date
      const day = String(date.getDate()).padStart(2, "0")
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const year = date.getFullYear()
      const formatted = `${day}.${month}.${year}`
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {formatted}
        </div>
      )
    }
  },
  {
    accessorKey: "target",
    header: "Target",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Moon className="h-4 w-4 text-muted-foreground" />
        {row.getValue("target")}
      </div>
    ),
  },
  {
    id: "location",
    accessorFn: (row) => `Bortle ${row.location_bortle}, ${row.location_name}`,
    header: "Location",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        {`Bortle ${row.original.location_bortle}, ${row.original.location_name}`}
      </div>
    ),
  },
  {
    id: "equipment",
    accessorFn: (row) => `${row.telescope}, ${row.camera}, ${row.filter}`,
    header: "Equipment",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Camera className="h-4 w-4 text-muted-foreground" />
        {`${row.original.telescope}, ${row.original.camera}, ${row.original.filter}`}
      </div>
    ),
  },
  {
    id: "exposure",
    accessorFn: (row) => `${row.total_subs} x ${row.sub_length}s`,
    header: "Exposure",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        {`${row.original.total_subs} x ${row.original.sub_length}s`}
      </div>
    ),
  }
]
