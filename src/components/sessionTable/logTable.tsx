'use client';

import styles from './logTable.module.scss';
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
import React, { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { useAppState } from '@/context/stateProvider';
import { sessionsColumns } from './sessionsColumns';
import { ChevronDown } from 'lucide-react';
import { UUID } from 'crypto';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '../ui/context-menu';
import { DeleteSVG } from '@/public/svgs';
import { invoke } from '@tauri-apps/api/core';
import { toast } from '@/components/ui/use-toast';
import { useModal } from '@/context/modalProvider';
import NewImagingSession from '@/components/modals/imagingSession/newImagingSession';
import { calibrationColumns } from '@/components/sessionTable/calibrationColumns';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalibrationFrame, ImagingSession } from '@/interfaces/state';
import CalibrationRowEditor from '@/components/modals/calibrationRowEditor';

interface SessionTableProps {
  setSelectedSessionId: React.Dispatch<React.SetStateAction<UUID | undefined>>;
}

export function LogTable<TData, TValue>({
  setSelectedSessionId,
}: SessionTableProps) {
  const tabKeys = ['sessions', 'calibration'] as const;
  type TableContent = (typeof tabKeys)[number];

  const { appState } = useAppState();
  const { openModal } = useModal();

  const [content, setContent] = useState<TableContent>('sessions');
  const [data, setData] = useState<TData[]>(
    appState.table_data.sessions as TData[],
  );
  const [columns, setColumns] = useState<ColumnDef<TData, TValue>[]>(
    sessionsColumns as ColumnDef<TData, TValue>[],
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedRowId, setSelectedRowId] = useState<string | undefined>(
    undefined,
  );
  const [rowSelected, setRowSelected] = useState<boolean>(false);

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
    switch (content) {
      case 'sessions':
        setData(appState.table_data.sessions as TData[]);
        setColumns(sessionsColumns as ColumnDef<TData, TValue>[]);
        break;
      case 'calibration':
        setData(appState.table_data.calibration as TData[]);
        setColumns(calibrationColumns as ColumnDef<TData, TValue>[]);
        break;
    }
  }, [appState.table_data, content]);

  useEffect(() => {
    setRowSelected(selectedRowId !== undefined);
  }, [selectedRowId]);

  const handleRowClick = (rowId: string) => {
    if (rowId === selectedRowId) {
      setSelectedRowId(undefined);
    } else {
      setSelectedRowId(rowId);
    }

    const rowData = table.getRowModel().rows.find((row) => row.id === rowId)
      ?.original as ImagingSession;
    setSelectedSessionId(rowData.id);
  };

  function openImagingSession(): void {
    invoke('open_imaging_session', { id: selectedRowId }).catch((error) => {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Error: ' + error,
      });
    });
  }

  function editCalibrationFrame() {
    const calibrationFrame = table
      .getRowModel()
      .rows.find((row) => row.id === selectedRowId)
      ?.original as CalibrationFrame;
    openModal(
      <CalibrationRowEditor edit={true} calibrationFrame={calibrationFrame} />,
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger className="h-full">
        <div className={styles.component}>
          <div className={styles.header}>
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className={styles.searchField}
            />
            <Tabs defaultValue="sessions">
              <TabsList>
                <TabsTrigger
                  value="sessions"
                  onClick={() => setContent('sessions')}
                >
                  Imaging Sessions
                </TabsTrigger>
                <TabsTrigger
                  value="calibration"
                  onClick={() => setContent('calibration')}
                >
                  Calibration
                </TabsTrigger>
              </TabsList>
            </Tabs>
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
              <TableBody className="cursor-pointer">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      onClick={() => handleRowClick(row.id)}
                      className={
                        selectedRowId === row.id ? styles.selectedRow : ''
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {cell.getValue() === null
                            ? 'N/A'
                            : flexRender(
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
      {content === 'sessions' && (
        <ContextMenuContent className="w-64">
          <ContextMenuItem
            inset
            disabled={!rowSelected}
            onClick={openImagingSession}
          >
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
          <ContextMenuItem
            inset
            disabled={!rowSelected}
            className={styles.delete}
          >
            Delete
            <ContextMenuShortcut>
              <DeleteSVG />
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            inset
            onClick={() => openModal(<NewImagingSession />)}
          >
            Add new Session...
          </ContextMenuItem>
        </ContextMenuContent>
      )}
      {content === 'calibration' && (
        <ContextMenuContent className="w-64">
          <ContextMenuItem
            inset
            disabled={!rowSelected}
            onClick={openImagingSession}
          >
            Open...
            <ContextMenuShortcut>⌘]</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            inset
            disabled={!rowSelected}
            onClick={() => editCalibrationFrame()}
          >
            Edit...
            <ContextMenuShortcut>⌘]</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            inset
            disabled={!rowSelected}
            className={styles.delete}
          >
            Delete
            <ContextMenuShortcut>
              <DeleteSVG />
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            inset
            onClick={() => openModal(<NewImagingSession />)}
          >
            Add new Frames...
          </ContextMenuItem>
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
}
