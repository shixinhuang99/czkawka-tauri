import { useAtom, useAtomValue } from 'jotai';
import {
  createFlatDataAtom,
  currentToolFilterAtom,
  currentToolRowSelectionAtom,
  currentToolSortingAtom,
} from '~/atom/tools';
import { createColumns, DataTable } from '~/components/data-table';
import { COLUMN_MIN_SIZES } from '~/consts';
import { useT } from '~/hooks';
import type { FileEntry } from '~/types';

const dataAtom = createFlatDataAtom<FileEntry>();

export function EmptyFiles({ className }: { className?: string }) {
  const t = useT();
  const data = useAtomValue(dataAtom);
  const [rowSelection, setRowSelection] = useAtom(currentToolRowSelectionAtom);
  const [sorting, setSorting] = useAtom(currentToolSortingAtom);
  const [filter, setFilter] = useAtom(currentToolFilterAtom);

  const columns = createColumns<FileEntry>([
    {
      accessorKey: 'fileName',
      header: t('fileName'),
      size: 180,
      minSize: COLUMN_MIN_SIZES.fileName,
    },
    {
      accessorKey: 'path',
      header: t('path'),
      size: 430,
      minSize: COLUMN_MIN_SIZES.path,
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
