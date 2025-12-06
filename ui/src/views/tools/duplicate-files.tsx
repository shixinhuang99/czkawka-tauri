import type { Row } from '@tanstack/react-table';
import { useAtom, useAtomValue } from 'jotai';
import { settingsAtom } from '~/atom/settings';
import {
  createSortedAndGroupedDataAtom,
  currentToolRowSelectionAtom,
  currentToolSortingAtom,
} from '~/atom/tools';
import { createColumns, DataTable, PathCell } from '~/components/data-table';
import { COLUMN_MIN_SIZES } from '~/consts';
import { useT } from '~/hooks';
import type { DuplicateEntry } from '~/types';
import { ImagePreview } from '../image-preview';

const sortedAndGroupedDataAtom = createSortedAndGroupedDataAtom<DuplicateEntry>(
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
      hash: '',
      isRef: true,
      hidden: true,
      isImage: false,
      rawData: {
        path: '',
        modified_date: 0,
        size: 0,
        hash: '',
      },
    };
  },
);

export function DuplicateFiles({ className }: { className?: string }) {
  const data = useAtomValue(sortedAndGroupedDataAtom);
  const [rowSelection, setRowSelection] = useAtom(currentToolRowSelectionAtom);
  const [sorting, setSorting] = useAtom(currentToolSortingAtom);
  const t = useT();

  const columns = createColumns<DuplicateEntry>([
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
      cell: FileNameCell,
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
      manualSorting
    />
  );
}

function FileNameCell({ row }: { row: Row<DuplicateEntry> }) {
  const { hidden, path, fileName, isImage } = row.original;

  const settings = useAtomValue(settingsAtom);

  if (hidden) {
    return null;
  }

  if (settings.duplicateImagePreview && isImage) {
    return (
      <ImagePreview path={path}>
        <div className="truncate">{fileName}</div>
      </ImagePreview>
    );
  }

  return fileName;
}
