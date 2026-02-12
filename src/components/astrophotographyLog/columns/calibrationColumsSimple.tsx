'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CalibrationFrame } from '@/interfaces/state';
import { SortableHeader } from '@/components/ui/custom/tableHeader';
import { Calendar } from '@/components/ui/calendar';
import { Camera, Clock, SlidersHorizontal, Tag } from 'lucide-react';

export const calibrationColumnsSimple: ColumnDef<CalibrationFrame>[] = [
  {
    accessorKey: "camera",
    header: "Camera",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Camera className="h-4 w-4 text-muted-foreground" />
        {row.getValue("camera")}
      </div>
    ),
  },
  {
    accessorKey: "calibration_type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("calibration_type") as string
      return (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {type}
        </div>
      )
    },
  },
  {
    id: "settings",
    accessorFn: (row) => {
      const gainIso = row.gain ?? "—"
      const offset = row.offset ?? "—"
      const bin = row.binning ?? 1
      return `G ${gainIso} · O ${offset} · ${bin}x${bin}`
    },
    header: "Settings",
    cell: ({ row }) => {
      const gainIso = row.original.gain ?? "—"
      const offset = row.original.offset ?? "—"
      const bin = row.original.binning ?? 1
      return (
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          {`G ${gainIso} · O ${offset} · ${bin}x${bin}`}
        </div>
      )
    },
  },
  {
    id: "exposure",
    accessorFn: (row) => {
      const subs = row.total_subs ?? 0
      const subLen = row.sub_length
      const temp = row.camera_temp
      // Bias: sub_length kann null sein → dann "Bias"
      const exposureLabel =
        subLen == null ? "Bias" : `${subs} × ${subLen}s`
      const tempLabel =
        temp == null ? "—" : `${temp}°C`
      return `${exposureLabel} · ${tempLabel}`
    },
    header: "Exposure",
    cell: ({ row }) => {
      const subs = row.original.total_subs ?? 0
      const subLen = row.original.sub_length
      const temp = row.original.camera_temp
      const exposureLabel =
        subLen == null ? "Bias" : `${subs} × ${subLen}s`
      const tempLabel =
        temp == null ? "—" : `${temp}°C`

      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {`${exposureLabel} · ${tempLabel}`}
        </div>
      )
    },
  },
  {
    id: "created",
    accessorFn: (row) => (row.created_at ? new Date(row.created_at) : null),
    header: "Created",
    cell: ({ getValue }) => {
      const date = getValue() as Date | null
      if (!date) {
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            —
          </div>
        )
      }
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
    },
  },
];
