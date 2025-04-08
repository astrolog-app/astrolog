'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  ColumnDef, ColumnSort,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table';
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu';
import { rankItem } from "@tanstack/match-sorter-utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  globalFilter: string;
  setValue: Dispatch<SetStateAction<any>>;
  children?: ReactNode;
  columnSort?: ColumnSort[];
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  console.log(columnId)
  return itemRank.passed
}

// TODO: make date sortable (search bar)
export function DataTable<TData, TValue>({ columns, data, globalFilter, setValue, children, columnSort = [] }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(columnSort);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter
    },
    globalFilterFn: fuzzyFilter,
  });

  useEffect(() => {
    setSorting(columnSort);
  }, [columns]);

  useEffect(() => {
    setSelectedRowId(null);
  }, [data]);

  const handleRowClick = (row: any) => {
    setSelectedRowId(row.id);
    setValue(row.original);
  };

  return (
    <ContextMenu key={columns.length}>
      { /* add the key to close context menu when changing tables */ }
      <ContextMenuTrigger className="h-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  // Apply a data attribute that can be used in CSS for highlighting
                  data-state={row.id === selectedRowId ? 'selected' : undefined}
                  onClick={() => handleRowClick(row)}
                  // Ensure the cursor appears as a pointer on hover
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.getValue() === null
                        ? 'N/A'
                        : flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ContextMenuTrigger>
      {children}
    </ContextMenu>
  );
}
