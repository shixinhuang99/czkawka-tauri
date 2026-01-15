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
import type { BrokenEntry } from '~/types';

const dataAtom = createFlatDataAtom<BrokenEntry>();

export function BrokenFiles({ className }: { className?: string }) {
  const data = useAtomValue(dataAtom);
  const [rowSelection, setRowSelection] = useAtom(currentToolRowSelectionAtom);
  const [sorting, setSorting] = useAtom(currentToolSortingAtom);
  const [filter, setFilter] = useAtom(currentToolFilterAtom);
  const t = useT();

  const columns = createColumns<BrokenEntry>([
    {
      accessorKey: 'fileName',
      header: t('fileName'),
      size: 180,
      minSize: COLUMN_MIN_SIZES.fileName,
    },
    {
      accessorKey: 'path',
      header: t('path'),
      size: 190,
      minSize: COLUMN_MIN_SIZES.path,
    },
    {
      accessorKey: 'errorString',
      header: t('typeOfError'),
      size: COLUMN_MIN_SIZES.typeOfError,
      minSize: COLUMN_MIN_SIZES.typeOfError,
    },
    {
      accessorKey: 'size',
      header: t('size'),
      size: COLUMN_MIN_SIZES.size,
      minSize: COLUMN_MIN_SIZES.size,
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
