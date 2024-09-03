'use client';

import styles from './sessionTable.module.scss';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import React, { useEffect } from 'react';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Session, useAppState } from '@/context/stateProvider';
import { columns as imagingSessionColumns } from './columns';
import { ChevronDown } from 'lucide-react';
import { UUID } from 'crypto';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger
} from '../ui/context-menu';
import { DeleteSVG } from '@/app/svgs';
import { invoke } from '@tauri-apps/api/tauri';
import { toast } from '@/components/ui/use-toast';
import { useModal } from '@/context/modalProvider';
import NewImagingSession from '@/components/modals/newImagingSession/newImagingSession';

export function SessionTable<TData, TValue>({ setSelectedSessionId }: { setSelectedSessionId: (id: UUID) => void }) {
  const { appState } = useAppState();
  const { openModal } = useModal();

  const data: TData[] = appState.log_data as TData[];
  const columns: ColumnDef<TData, TValue>[] =
    imagingSessionColumns as ColumnDef<TData, TValue>[];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>('');
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [selectedRowId, setSelectedRowId] = React.useState<string | undefined>(undefined);
  const [rowSelected, setRowSelected] = React.useState<boolean>(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnVisibility,
    },
    globalFilterFn: 'includesString',
  });

  useEffect(() => {
    setRowSelected(selectedRowId !== undefined);
  }, [selectedRowId]);

  const handleRowClick = (rowId: string) => {
    if (rowId === selectedRowId) {
      setSelectedRowId(undefined);
    } else {
      setSelectedRowId(rowId);
    }

    const rowData = table.getRowModel().rows.find((row) => row.id === rowId)?.original as Session;
    setSelectedSessionId(rowData.id);
  };

  async function openImagingSession() {
    try {
      await invoke('open_imaging_session', { id: selectedRowId });
    } catch (error) {
      const errorMsg = error as string;
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Error: " + errorMsg
      })
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger className='h-full'>
        <div className={styles.component}>
          <div className={styles.header}>
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className={styles.searchField}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className={styles.tableWrapper}>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className='cursor-pointer'>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      onClick={() => handleRowClick(row.id)}
                      className={selectedRowId === row.id ? styles.selectedRow : ''}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem inset disabled={!rowSelected} onClick={openImagingSession}>
          Open...
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset disabled={!rowSelected}>
          Edit...
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset disabled={!rowSelected}>
          Details...
        </ContextMenuItem>
        <ContextMenuItem inset disabled={!rowSelected} className={styles.delete}>
          Delete
          <ContextMenuShortcut>{DeleteSVG}</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem inset onClick={() => openModal(<NewImagingSession />)}>
          Add new Session...
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
