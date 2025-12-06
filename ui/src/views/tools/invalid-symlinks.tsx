import { useAtom, useAtomValue } from 'jotai';
import {
  currentToolDataAtom,
  currentToolRowSelectionAtom,
  currentToolSortingAtom,
} from '~/atom/tools';
import { createColumns, DataTable } from '~/components/data-table';
import { COLUMN_MIN_SIZES } from '~/consts';
import { useT } from '~/hooks';
import type { SymlinksFileEntry } from '~/types';

export function InvalidSymlinks({ className }: { className?: string }) {
  const data = useAtomValue(currentToolDataAtom) as SymlinksFileEntry[];
  const [rowSelection, setRowSelection] = useAtom(currentToolRowSelectionAtom);
  const [sorting, setSorting] = useAtom(currentToolSortingAtom);
  const t = useT();

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
        sortingFn: 'sortByRawDataNumber',
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
    />
  );
}
