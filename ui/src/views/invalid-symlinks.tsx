import { useAtom, useAtomValue } from 'jotai';
import {
  invalidSymlinksAtom,
  invalidSymlinksRowSelectionAtom,
} from '~/atom/primitive';
import { currentToolSortingAtom } from '~/atom/tools';
import { createColumns, DataTable } from '~/components/data-table';
import { useT } from '~/hooks';
import type { SymlinksFileEntry } from '~/types';

export function InvalidSymlinks() {
  const data = useAtomValue(invalidSymlinksAtom);
  const [rowSelection, setRowSelection] = useAtom(
    invalidSymlinksRowSelectionAtom,
  );
  const [sorting, setSorting] = useAtom(currentToolSortingAtom);
  const t = useT();

  const columns = createColumns<SymlinksFileEntry>(
    [
      {
        accessorKey: 'symlinkName',
        header: t('symlinkName'),
        size: 180,
        minSize: 110,
      },
      {
        accessorKey: 'path',
        header: t('symlinkPath'),
        size: 220,
        minSize: 110,
      },
      {
        accessorKey: 'destinationPath',
        header: t('destinationPath'),
        size: 220,
        minSize: 130,
      },
      {
        accessorKey: 'typeOfError',
        header: t('typeOfError'),
        size: 140,
        minSize: 110,
      },
      {
        accessorKey: 'modifiedDate',
        header: t('modifiedDate'),
        size: 160,
        minSize: 120,
      },
    ],
    { withOutActions: true },
  );

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
