import * as React from 'react';
import { cn } from '../lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
}

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField = 'id',
  isLoading = false,
  emptyMessage = 'No data available',
  className,
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto rounded-md border', className)}>
      <table className="w-full caption-bottom text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'h-10 px-4 text-left align-middle font-medium text-muted-foreground',
                  col.sortable && 'cursor-pointer hover:text-foreground',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={String(item[keyField])}
              className={cn(
                'border-b transition-colors hover:bg-muted/50',
                onRowClick && 'cursor-pointer',
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('p-4 align-middle', col.className)}>
                  {col.render ? col.render(item) : String(item[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { DataTable };
