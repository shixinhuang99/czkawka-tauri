import { useAtom, useAtomValue } from 'jotai';
import toSeconds from 'sec';
import {
  createSortedAndGroupedDataAtom,
  currentToolRowSelectionAtom,
  currentToolSortingAtom,
} from '~/atom/tools';
import { createColumns, DataTable, PathCell } from '~/components/data-table';
import { COLUMN_MIN_SIZES } from '~/consts';
import { useT } from '~/hooks';
import type { MusicEntry } from '~/types';

const sortedAndGroupedDataAtom = createSortedAndGroupedDataAtom<MusicEntry>(
  (a, b, columnSort) => {
    const { id, desc } = columnSort;
    let comparison = 0;

    if (id === 'size' || id === 'modified_date' || id === 'bitrate') {
      comparison = a.rawData[id] - b.rawData[id];
    } else if (
      id === 'path' ||
      id === 'fileName' ||
      id === 'trackTitle' ||
      id === 'trackArtist' ||
      id === 'year'
    ) {
      comparison = a[id].localeCompare(b[id]);
    } else if (id === 'length') {
      comparison = toSeconds(a[id]) - toSeconds(b[id]);
    }

    return desc ? -comparison : comparison;
  },
  (fakePath) => {
    return {
      size: '',
      fileName: '',
      path: fakePath,
      modifiedDate: '',
      trackTitle: '',
      trackArtist: '',
      year: '',
      length: '',
      genre: '',
      bitrate: '',
      isRef: true,
      hidden: true,
      rawData: {
        path: '',
        size: 0,
        modified_date: 0,
        track_title: '',
        track_artist: '',
        year: '',
        length: '',
        genre: '',
        bitrate: 0,
      },
    };
  },
);

export function MusicDuplicates({ className }: { className?: string }) {
  const data = useAtomValue(sortedAndGroupedDataAtom);
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
      cell: PathCell,
    },
    {
      accessorKey: 'modifiedDate',
      header: t('modifiedDate'),
      size: COLUMN_MIN_SIZES.modifiedDate,
      minSize: COLUMN_MIN_SIZES.modifiedDate,
      id: 'modified_date',
    },
  ]);

  return (
    <DataTable
      className={className}
      data={data}
      columns={columns}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      sorting={sorting}
      onSortingChange={setSorting}
      manualSorting
    />
  );
}
