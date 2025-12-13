import { useAtom, useAtomValue } from 'jotai';
import {
  createProcessedDataAtom,
  currentToolFilterAtom,
  currentToolRowSelectionAtom,
  currentToolSortingAtom,
} from '~/atom/tools';
import { createColumns, DataTable, PathCell } from '~/components/data-table';
import { COLUMN_MIN_SIZES } from '~/consts';
import { useT } from '~/hooks';
import type { VideosEntry } from '~/types';

const processedDataAtom = createProcessedDataAtom<VideosEntry>(
  (a, b, columnSort) => {
    const { id, desc } = columnSort;
    let comparison = 0;

    if (id === 'size' || id === 'modified_date') {
      comparison = a.rawData[id] - b.rawData[id];
    } else if (id === 'path' || id === 'fileName') {
      comparison = a[id].localeCompare(b[id]);
    }

    return desc ? -comparison : comparison;
  },
  (fakePath) => {
    return {
      size: '',
      fileName: '',
      path: fakePath,
      modifiedDate: '',
      isRef: true,
      hidden: true,
      rawData: {
        path: '',
        size: 0,
        modified_date: 0,
      },
    };
  },
  ['size', 'fileName', 'path', 'modifiedDate'],
);

export function SimilarVideos({ className }: { className?: string }) {
  const data = useAtomValue(processedDataAtom);
  const [rowSelection, setRowSelection] = useAtom(currentToolRowSelectionAtom);
  const [sorting, setSorting] = useAtom(currentToolSortingAtom);
  const [filter, setFilter] = useAtom(currentToolFilterAtom);
  const t = useT();

  const columns = createColumns<VideosEntry>([
    {
      accessorKey: 'size',
      header: t('size'),
      size: 110,
      minSize: COLUMN_MIN_SIZES.size,
    },
    {
      accessorKey: 'fileName',
      header: t('fileName'),
      size: 180,
      minSize: COLUMN_MIN_SIZES.fileName,
    },
    {
      accessorKey: 'path',
      header: t('path'),
      size: 320,
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
      globalFilter={filter}
      onGlobalFilterChange={setFilter}
      manualSorting
      manualFiltering
    />
  );
}
