import { useAtom, useAtomValue } from 'jotai';
import {
  musicDuplicatesAtom,
  musicDuplicatesRowSelectionAtom,
} from '~/atom/primitive';
import { currentToolSortingAtom } from '~/atom/tools';
import { createColumns, DataTable } from '~/components/data-table';
import { useT } from '~/hooks';
import type { MusicEntry } from '~/types';

export function MusicDuplicates() {
  const data = useAtomValue(musicDuplicatesAtom);
  const [rowSelection, setRowSelection] = useAtom(
    musicDuplicatesRowSelectionAtom,
  );
  const [sorting, setSorting] = useAtom(currentToolSortingAtom);
  const t = useT();

  const columns = createColumns<MusicEntry>([
    {
      accessorKey: 'size',
      header: t('size'),
      size: 110,
      minSize: 50,
    },
    {
      accessorKey: 'fileName',
      header: t('fileName'),
      size: 180,
      minSize: 100,
    },
    {
      accessorKey: 'trackTitle',
      header: t('title'),
      size: 100,
      minSize: 60,
    },
    {
      accessorKey: 'trackArtist',
      header: t('artist'),
      size: 100,
      minSize: 60,
    },
    {
      accessorKey: 'year',
      header: t('year'),
      size: 100,
      minSize: 60,
    },
    {
      accessorKey: 'bitrate',
      header: t('bitrate'),
      size: 100,
      minSize: 70,
    },
    {
      accessorKey: 'length',
      header: t('length'),
      size: 100,
      minSize: 70,
    },
    {
      accessorKey: 'path',
      header: t('path'),
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
      header: t('modifiedDate'),
      size: 160,
      minSize: 120,
    },
  ]);

  return (
    <DataTable
      className="flex-1 rounded-none border-none grow"
      data={data}
      columns={columns}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
}
