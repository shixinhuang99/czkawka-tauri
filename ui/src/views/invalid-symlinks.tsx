import { useAtom, useAtomValue } from 'jotai';
import {
  invalidSymlinksAtom,
  invalidSymlinksRowSelectionAtom,
} from '~/atom/primitive';
import { DataTable, createColumns } from '~/components/data-table';
import { useT } from '~/hooks';
import type { SymlinksFileEntry } from '~/types';

export function InvalidSymlinks() {
  const data = useAtomValue(invalidSymlinksAtom);
  const [rowSelection, setRowSelection] = useAtom(
    invalidSymlinksRowSelectionAtom,
  );
  const t = useT();

  const columns = createColumns<SymlinksFileEntry>([
    {
      accessorKey: 'symlinkName',
      header: t('Symlink name'),
      size: 180,
      minSize: 110,
    },
    {
      accessorKey: 'path',
      header: t('Symlink path'),
      size: 220,
      minSize: 110,
    },
    {
      accessorKey: 'destinationPath',
      header: t('Destination path'),
      size: 220,
      minSize: 130,
    },
    {
      accessorKey: 'typeOfError',
      header: t('Type of error'),
      size: 140,
      minSize: 110,
    },
    {
      accessorKey: 'modifiedDate',
      header: t('Modified date'),
      size: 160,
      minSize: 120,
    },
  ]);

  return (
    <DataTable
      className="flex-1 rounded-none border-none grow"
      data={data}
      columns={columns}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
    />
  );
}
