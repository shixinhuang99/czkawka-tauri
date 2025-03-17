import type { ColumnDef } from '@tanstack/react-table';
import { useAtom, useAtomValue } from 'jotai';
import {
  similarVideosAtom,
  similarVideosRowSelectionAtom,
} from '~/atom/primitive';
import {
  DataTable,
  TableActions,
  TableRowSelectionCell,
  TableRowSelectionHeader,
} from '~/components/data-table';
import type { VideosEntry } from '~/types';

const columns: ColumnDef<VideosEntry>[] = [
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
      if (row.original.isRef) {
        return null;
      }
      return <TableRowSelectionCell row={row} />;
    },
  },
  {
    accessorKey: 'size',
    header: 'Size',
    size: 110,
    minSize: 50,
  },
  {
    accessorKey: 'fileName',
    header: 'File name',
    size: 180,
    minSize: 100,
  },
  {
    accessorKey: 'path',
    header: 'Path',
    size: 320,
    minSize: 100,
    cell: ({ row }) => {
      if (row.original.hidden) {
        return null;
      }
      return row.original.path;
    },
  },
  {
    accessorKey: 'modifiedDate',
    header: 'Modified date',
    size: 160,
    minSize: 120,
  },
  {
    id: 'actions',
    size: 50,
    minSize: 50,
    cell: ({ cell }) => {
      if (cell.row.original.isRef) {
        return null;
      }
      return <TableActions path={cell.row.original.path} />;
    },
  },
];

export function SimilarVideos() {
  const data = useAtomValue(similarVideosAtom);
  const [rowSelection, setRowSelection] = useAtom(
    similarVideosRowSelectionAtom,
  );

  return (
    <DataTable
      className="flex-1 rounded-none border-none grow"
      data={data}
      columns={columns}
      rowIdField="path"
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
    />
  );
}
