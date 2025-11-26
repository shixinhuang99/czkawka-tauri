import {
  type Column,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Table as TTable,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  FolderOpenIcon,
} from 'lucide-react';
import { useRef } from 'react';
import { useT } from '~/hooks';
import { scrollBar } from '~/styles';
import type { BaseEntry } from '~/types';
import { cn } from '~/utils/cn';
import { Button } from './shadcn/button';
import { Checkbox } from './shadcn/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './shadcn/table';
import { toastError } from './toast';
import { TooltipButton } from './tooltip-button';

export type SortingStateUpdater =
  | SortingState
  | ((v: SortingState) => SortingState);

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  className?: string;
  emptyTip?: React.ReactNode;
  layout?: 'grid' | 'resizeable';
  rowSelection: RowSelectionState;
  onRowSelectionChange: (
    v: RowSelectionState | ((v: RowSelectionState) => RowSelectionState),
  ) => void;
  sorting: SortingState;
  onSortingChange: (v: SortingStateUpdater) => void;
}

export type RowSelection = RowSelectionState;

export function DataTable<T extends BaseEntry>({
  data,
  columns,
  className,
  emptyTip,
  layout = 'resizeable',
  rowSelection,
  onRowSelectionChange,
  sorting,
  onSortingChange,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: 'onChange',
    getRowId: (row) => row.path,
    state: {
      rowSelection,
      sorting,
    },
    onRowSelectionChange,
    enableRowSelection: (row) => {
      const original = row.original as { isRef?: boolean; hidden?: boolean };
      if (original.isRef || original.hidden) {
        return false;
      }
      return true;
    },
    onSortingChange,
  });
  const t = useT();

  const isGrid = layout === 'grid';
  const isResizeable = layout === 'resizeable';

  return (
    <div
      className={cn(
        'rounded-sm border overflow-x-auto overflow-y-hidden',
        scrollBar(),
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
                      <button
                        type="button"
                        tabIndex={0}
                        className="w-1 h-full border-border border-r hover:bg-primary cursor-col-resize absolute right-0"
                        onDoubleClick={() => header.column.resetSize()}
                        onMouseDown={header.getResizeHandler()}
                        title={t('resetOnDoubleClick')}
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
  const t = useT();

  const isGrid = layout === 'grid';
  const isResizeable = layout === 'resizeable';

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', scrollBar())}
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
              <span className="text-muted-foreground">
                {emptyTip || t('noData')}
              </span>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </div>
  );
}

export function TableRowSelectionHeader<T>({ table }: { table: TTable<T> }) {
  return (
    <Checkbox
      checked={
        table.getIsAllRowsSelected() ||
        (table.getIsSomeRowsSelected() && 'indeterminate')
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  );
}

export function TableRowSelectionCell<T>({ row }: { row: Row<T> }) {
  return (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
      className="translate-y-[2px]"
    />
  );
}

export function createColumns<T>(columns: ColumnDef<T>[]): ColumnDef<T>[] {
  return [
    {
      id: 'select',
      meta: {
        span: 1,
      },
      size: 40,
      minSize: 40,
      header: ({ table }) => {
        return <TableRowSelectionHeader table={table} />;
      },
      cell: ({ row }) => {
        return <TableRowSelectionCell row={row} />;
      },
    },
    ...columns,
  ];
}

export function TableActions({ path }: { path: string }) {
  const t = useT();

  const handleClick = () => {
    revealItemInDir(path).catch((err) => {
      toastError(t('opreationFailed'), err);
    });
  };

  return (
    <TooltipButton
      tooltip={t('revealInDir', {
        name: PLATFORM === 'darwin' ? t('finder') : t('fileExplorer'),
      })}
      onClick={handleClick}
    >
      <FolderOpenIcon />
    </TooltipButton>
  );
}

export function createActionsColumn<
  T extends { path: string },
>(): ColumnDef<T> {
  return {
    id: 'actions',
    size: 55,
    minSize: 55,
    cell: ({ cell }) => {
      return <TableActions path={cell.row.original.path} />;
    },
  };
}

export function createSortableColumnHeader(title: React.ReactNode) {
  return function SortableColumnHeader({ column }: { column: Column<any> }) {
    const direction = column.getIsSorted();

    const handleClick = () => {
      if (direction === false) {
        column.toggleSorting(true);
      } else if (direction === 'desc') {
        column.toggleSorting(false);
      } else {
        column.clearSorting();
      }
    };

    return (
      <Button variant="ghost" onClick={handleClick} className="gap-2">
        {title}
        {direction === 'asc' && <ArrowUpIcon />}
        {direction === 'desc' && <ArrowDownIcon />}
        {direction === false && <ArrowUpDownIcon />}
      </Button>
    );
  };
}

export function createSortingFn<T extends { rawData: Record<string, any> }>(
  field: string,
  type: 'string' | 'number',
) {
  if (type === 'number') {
    return (rowA: Row<T>, rowB: Row<T>) => {
      const fieldA = rowA.original.rawData[field];
      const fieldB = rowB.original.rawData[field];
      return fieldA - fieldB;
    };
  }
  return (rowA: Row<T>, rowB: Row<T>) => {
    const fieldA = rowA.original.rawData[field];
    const fieldB = rowB.original.rawData[field];
    return fieldA.localeCompare(fieldB);
  };
}
