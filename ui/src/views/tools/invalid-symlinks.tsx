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
import type { SymlinksFileEntry } from '~/types';

const dataAtom = createFlatDataAtom<SymlinksFileEntry>();

export function InvalidSymlinks({ className }: { className?: string }) {
  const t = useT();
  const data = useAtomValue(dataAtom);
  const [rowSelection, setRowSelection] = useAtom(currentToolRowSelectionAtom);
  const [sorting, setSorting] = useAtom(currentToolSortingAtom);
  const [filter, setFilter] = useAtom(currentToolFilterAtom);

  const columns = createColumns<SymlinksFileEntry>(
    [
      {
        accessorKey: 'symlinkName',
        header: t('symlinkName'),
        size: 180,
        minSize: COLUMN_MIN_SIZES.symlinkName,
      },
      {
        accessorKey: 'path',
        header: t('symlinkPath'),
        size: 220,
        minSize: COLUMN_MIN_SIZES.symlinkPath,
      },
      {
        accessorKey: 'destinationPath',
        header: t('destinationPath'),
        size: 220,
        minSize: COLUMN_MIN_SIZES.destinationPath,
      },
      {
        accessorKey: 'typeOfError',
        header: t('typeOfError'),
        size: COLUMN_MIN_SIZES.typeOfError,
        minSize: COLUMN_MIN_SIZES.typeOfError,
      },
      {
        accessorKey: 'modifiedDate',
        header: t('modifiedDate'),
        size: COLUMN_MIN_SIZES.modifiedDate,
        minSize: COLUMN_MIN_SIZES.modifiedDate,
        id: 'modified_date',
      },
    ],
    { customActions: true },
  );

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
