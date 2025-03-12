import {
  type ColumnDef,
  type OnChangeFn,
  type RowSelectionState,
  type Table as TTable,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { cn } from '~/utils/cn';
import { Checkbox } from './shadcn/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './shadcn/table';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  className?: string;
  emptyTip?: React.ReactNode;
  layout?: 'grid' | 'resizeable';
  rowIdField: keyof T;
  rowSelection: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
}

export type RowSelection = RowSelectionState;

export function DataTable<T>(props: DataTableProps<T>) {
  'use no memo';

  const {
    data,
    columns,
    className,
    emptyTip,
    layout = 'resizeable',
    rowIdField,
    rowSelection,
    onRowSelectionChange,
  } = props;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row[rowIdField] as string,
    onRowSelectionChange,
    state: {
      rowSelection,
    },
    columnResizeMode: 'onChange',
  });

  const isGrid = layout === 'grid';
  const isResizeable = layout === 'resizeable';

  return (
    <div
      className={cn(
        'rounded-sm border overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent scrollbar-thumb-rounded-full',
        className,
      )}
    >
      <Table
        className={cn('h-full', isResizeable && 'min-w-full')}
        style={{ width: isResizeable ? table.getTotalSize() : undefined }}
      >
        <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className={cn(
                'px-2',
                isGrid && 'grid grid-cols-12',
                isResizeable && 'flex',
              )}
            >
              {headerGroup.headers.map((header) => {
                const span = header.column.columnDef.meta?.span;
                return (
                  <TableHead
                    key={header.id}
                    className="relative flex items-center"
                    style={{
                      gridColumn:
                        isGrid && span
                          ? `span ${span} / span ${span}`
                          : undefined,
                      width: isResizeable ? header.getSize() : undefined,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    {isResizeable && (
                      <div
                        className="w-1 h-full border-border border-r hover:bg-primary cursor-col-resize absolute right-0"
                        onDoubleClick={() => header.column.resetSize()}
                        onMouseDown={header.getResizeHandler()}
                      />
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <DataTableBody table={table} emptyTip={emptyTip} layout={layout} />
      </Table>
    </div>
  );
}

interface TableBodyProps<T> {
  table: TTable<T>;
  emptyTip?: React.ReactNode;
  layout?: 'grid' | 'resizeable';
}

function DataTableBody<T>(props: TableBodyProps<T>) {
  const { table, emptyTip, layout } = props;
  const { rows = [] } = table.getRowModel();

  const containerRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: rows.length,
    estimateSize: () => 40,
    getScrollElement: () => containerRef.current,
    measureElement: (element) => element?.getBoundingClientRect().height,
    overscan: 5,
  });

  const isGrid = layout === 'grid';
  const isResizeable = layout === 'resizeable';

  return (
    <div
      ref={containerRef}
      className="overflow-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent scrollbar-thumb-rounded-full"
      style={{ height: 'calc(100% - 41px)' }}
    >
      <TableBody
        className="relative"
        style={{
          height: rows.length ? rowVirtualizer.getTotalSize() : '100%',
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
                className={cn(
                  'absolute w-full items-center px-2 h-10',
                  isGrid && 'grid grid-cols-12',
                  isResizeable && 'flex',
                )}
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                {row.getVisibleCells().map((cell) => {
                  const span = cell.column.columnDef.meta?.span;
                  return (
                    <TableCell
                      key={cell.id}
                      className="truncate"
                      title={cell.getValue<any>()}
                      style={{
                        gridColumn:
                          isGrid && span
                            ? `span ${span} / span ${span}`
                            : undefined,
                        width: isResizeable ? cell.column.getSize() : undefined,
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
          <TableRow className="h-full">
            <TableCell className="h-full flex justify-center items-center">
              {emptyTip || 'No data'}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </div>
  );
}

export function createColumns<T>(columns: ColumnDef<T>[]): ColumnDef<T>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      meta: {
        span: 1,
      },
      size: 40,
      minSize: 40,
    },
    ...columns,
  ];
}
