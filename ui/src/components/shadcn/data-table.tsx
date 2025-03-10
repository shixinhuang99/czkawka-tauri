import { useState, useRef } from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '~/utils/cn';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string;
  eleWhenNoData?: React.ReactNode;
}

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  'use no memo';

  const { columns, data, className, eleWhenNoData } = props;

  const [rowSelection, setRowSelection] = useState({});
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { rows = [] } = table.getRowModel();
  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => 53,
    getScrollElement: () => tableContainerRef.current,
    measureElement: (element) => element?.getBoundingClientRect().height,
    overscan: 5,
  });

  return (
    <div
      ref={tableContainerRef}
      className={cn(
        'rounded-sm border overflow-auto relative w-full scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent scrollbar-thumb-rounded-full',
        className,
      )}
    >
      <Table className="h-full">
        <TableHeader className="sticky top-0 z-[1] bg-background shadow-sm">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="grid grid-cols-12 px-2">
              {headerGroup.headers.map((header) => {
                const span = header.column.columnDef.meta?.span;
                return (
                  <TableHead
                    key={header.id}
                    style={{
                      gridColumn: span
                        ? `span ${span} / span ${span}`
                        : undefined,
                    }}
                    className="relative flex items-center"
                  >
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
        <TableBody
          className="relative"
          style={{
            height: rows.length ? rowVirtualizer.getTotalSize() : undefined,
          }}
        >
          {rows.length ? (
            rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  data-index={virtualRow.index}
                  ref={(node) => rowVirtualizer.measureElement(node)}
                  className="absolute w-full grid grid-cols-12 items-center px-2"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const span = cell.column.columnDef.meta?.span;
                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          gridColumn: span
                            ? `span ${span} / span ${span}`
                            : undefined,
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                {eleWhenNoData ? eleWhenNoData : 'No data'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
