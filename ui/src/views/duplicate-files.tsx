import type { Row } from '@tanstack/react-table';
import { useAtom, useAtomValue } from 'jotai';
import { settingsAtom } from '~/atom/settings';
import {
  createSortedAndGroupedDataAtom,
  currentToolRowSelectionAtom,
  currentToolSortingAtom,
} from '~/atom/tools';
import { createColumns, DataTable } from '~/components/data-table';
import { useT } from '~/hooks';
import type { DuplicateEntry } from '~/types';
import { ImagePreview } from './image-preview';

const sortedAndGroupedDataAtom = createSortedAndGroupedDataAtom<DuplicateEntry>(
  (a, b, columnSort) => {
    const { id, desc } = columnSort;
    if (id === 'size' || id === 'modified_date') {
      const comparison = a.rawData[id] - b.rawData[id];
      return desc ? -comparison : comparison;
    }

    if (id === 'path' || id === 'fileName') {
      const comparison = a[id].localeCompare(b[id]);
      return desc ? -comparison : comparison;
    }

    return 0;
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

export function DuplicateFiles() {
  const data = useAtomValue(sortedAndGroupedDataAtom);
  const [rowSelection, setRowSelection] = useAtom(currentToolRowSelectionAtom);
  const [sorting, setSorting] = useAtom(currentToolSortingAtom);
  const t = useT();

  const columns = createColumns<DuplicateEntry>([
    {
      accessorKey: 'size',
      header: t('size'),
      size: 110,
      minSize: 100,
    },
    {
      accessorKey: 'fileName',
      header: t('fileName'),
      size: 180,
      minSize: 120,
      cell: FileName,
    },
    {
      accessorKey: 'path',
      header: t('path'),
      size: 320,
      minSize: 100,
      cell: Path,
    },
    {
      accessorKey: 'modifiedDate',
      header: t('modifiedDate'),
      size: 160,
      minSize: 160,
      id: 'modified_date',
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
      manualSorting
    />
  );
}

function Path({ row }: { row: Row<DuplicateEntry> }) {
  const { hidden, path } = row.original;

  if (hidden) {
    return null;
  }

  return path;
}

function FileName({ row }: { row: Row<DuplicateEntry> }) {
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
