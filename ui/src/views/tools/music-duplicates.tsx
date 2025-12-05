import { useAtom, useAtomValue } from 'jotai';
import {
  currentToolDataAtom,
  currentToolRowSelectionAtom,
  currentToolSortingAtom,
} from '~/atom/tools';
import { createColumns, DataTable } from '~/components/data-table';
import { COLUMN_MIN_SIZES } from '~/consts';
import { useT } from '~/hooks';
import type { MusicEntry } from '~/types';

export function MusicDuplicates() {
  const data = useAtomValue(currentToolDataAtom) as MusicEntry[];
  const [rowSelection, setRowSelection] = useAtom(currentToolRowSelectionAtom);
  const [sorting, setSorting] = useAtom(currentToolSortingAtom);
  const t = useT();

  const columns = createColumns<MusicEntry>([
    {
      accessorKey: 'size',
      header: t('size'),
      size: COLUMN_MIN_SIZES.size,
      minSize: COLUMN_MIN_SIZES.size,
    },
    {
      accessorKey: 'fileName',
      header: t('fileName'),
      size: 200,
      minSize: COLUMN_MIN_SIZES.fileName,
    },
    {
      accessorKey: 'trackTitle',
      header: t('title'),
      size: COLUMN_MIN_SIZES.title,
      minSize: COLUMN_MIN_SIZES.title,
    },
    {
      accessorKey: 'trackArtist',
      header: t('artist'),
      size: COLUMN_MIN_SIZES.artist,
      minSize: COLUMN_MIN_SIZES.artist,
    },
    {
      accessorKey: 'year',
      header: t('year'),
      size: COLUMN_MIN_SIZES.year,
      minSize: COLUMN_MIN_SIZES.year,
    },
    {
      accessorKey: 'bitrate',
      header: t('bitrate'),
      size: COLUMN_MIN_SIZES.bitrate,
      minSize: COLUMN_MIN_SIZES.bitrate,
    },
    {
      accessorKey: 'length',
      header: t('length'),
      size: COLUMN_MIN_SIZES.length,
      minSize: COLUMN_MIN_SIZES.length,
    },
    {
      accessorKey: 'path',
      header: t('path'),
      size: 300,
      minSize: COLUMN_MIN_SIZES.path,
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
      size: COLUMN_MIN_SIZES.modifiedDate,
      minSize: COLUMN_MIN_SIZES.modifiedDate,
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
