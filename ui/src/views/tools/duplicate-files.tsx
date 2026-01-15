import type { Row } from '@tanstack/react-table';
import { useAtom, useAtomValue } from 'jotai';
import { settingsAtom } from '~/atom/settings';
import {
  createGroupedDataAtom,
  currentToolFilterAtom,
  currentToolRowSelectionAtom,
  currentToolSortingAtom,
} from '~/atom/tools';
import { createColumns, DataTable, PathCell } from '~/components/data-table';
import { COLUMN_MIN_SIZES } from '~/consts';
import { useT } from '~/hooks';
import type { DuplicateEntry } from '~/types';
import { ImagePreview } from '../image-preview';

const dataAtom = createGroupedDataAtom<DuplicateEntry>();

export function DuplicateFiles({ className }: { className?: string }) {
  const data = useAtomValue(dataAtom);
  const [rowSelection, setRowSelection] = useAtom(currentToolRowSelectionAtom);
  const [sorting, setSorting] = useAtom(currentToolSortingAtom);
  const [filter, setFilter] = useAtom(currentToolFilterAtom);
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
      globalFilter={filter}
      onGlobalFilterChange={setFilter}
      manualFiltering
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
