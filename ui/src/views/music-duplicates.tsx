import type { ColumnDef } from '@tanstack/react-table';
import { useAtom, useAtomValue } from 'jotai';
import {
  musicDuplicatesAtom,
  musicDuplicatesRowSelectionAtom,
} from '~/atom/primitive';
import {
  DataTable,
  TableActions,
  TableRowSelectionCell,
  TableRowSelectionHeader,
} from '~/components/data-table';
import { useT } from '~/hooks';
import type { MusicEntry } from '~/types';

export function MusicDuplicates() {
  const data = useAtomValue(musicDuplicatesAtom);
  const [rowSelection, setRowSelection] = useAtom(
    musicDuplicatesRowSelectionAtom,
  );
  const t = useT();

  const columns: ColumnDef<MusicEntry>[] = [
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
      header: t('Size'),
      size: 110,
      minSize: 50,
    },
    {
      accessorKey: 'fileName',
      header: t('File name'),
      size: 180,
      minSize: 100,
    },
    {
      accessorKey: 'trackTitle',
      header: t('Title'),
      size: 100,
      minSize: 60,
    },
    {
      accessorKey: 'trackArtist',
      header: t('Artist'),
      size: 100,
      minSize: 60,
    },
    {
      accessorKey: 'year',
      header: t('Year'),
      size: 100,
      minSize: 60,
    },
    {
      accessorKey: 'bitrate',
      header: t('Bitrate'),
      size: 100,
      minSize: 70,
    },
    {
      accessorKey: 'length',
      header: t('Length'),
      size: 100,
      minSize: 70,
    },
    {
      accessorKey: 'path',
      header: t('Path'),
      size: 220,
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
      header: t('Modified date'),
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

  return (
    <DataTable
      className="flex-1 rounded-none border-none grow"
      data={data}
      columns={columns}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
    />
  );
}
