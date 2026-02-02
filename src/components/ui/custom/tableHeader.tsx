import { Column } from '@tanstack/react-table';
import { Button } from '../../ui/button';
import { ArrowUpDown } from 'lucide-react';
import { DualUnit, useUnit } from '@/components/ui/custom/units';

type SortableHeaderProps<TData> = {
  column: Column<TData, unknown>;
  title: string;
};

export function SortableHeader<TData>({
                                        column,
                                        title,
                                      }: SortableHeaderProps<TData>) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

type UnitsHeaderProps<TData, TUnit extends string> = {
  column: Column<TData, unknown>;
  title: string;
  unitCfg: DualUnit<TUnit>;
};

export function UnitsHeader<TData, TUnit extends string>({
                                                           column,
                                                           title,
                                                           unitCfg,
                                                         }: UnitsHeaderProps<TData, TUnit>) {
  const unit = useUnit(unitCfg);
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title} [{unit}]
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}
