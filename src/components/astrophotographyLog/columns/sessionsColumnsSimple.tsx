'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Calendar, Camera, Clock, MapPin, Moon } from 'lucide-react';
import { ImagingSession } from '@/interfaces/state';

export const sessionsColumnsSimple: ColumnDef<ImagingSession>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ getValue }) => {
      const rawValue = getValue() as string
      const date = new Date(rawValue)
      // Ensure day and month have leading zeros
      const day = String(date.getDate()).padStart(2, "0")
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const year = date.getFullYear()
      const formattedDate = `${day}.${month}.${year}`

      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {formattedDate}
        </div>
      )
    },
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
    header: "Location",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        {`Bortle ${row.original.location_bortle}, ${row.original.location_name}`}
      </div>
    ),
  },
  {
    header: "Equipment",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Camera className="h-4 w-4 text-muted-foreground" />
        {`${row.original.telescope}, ${row.original.camera}, ${row.original.filter}`}
      </div>
    ),
  },
  {
    header: "Exposure",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        {`${row.original.total_subs} x ${row.original.sub_length}s`}
      </div>
    ),
  },
]
