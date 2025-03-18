import { useAtom, useAtomValue } from 'jotai';
import {
  invalidSymlinksAtom,
  invalidSymlinksRowSelectionAtom,
} from '~/atom/primitive';
import { DataTable, createColumns } from '~/components/data-table';
import type { SymlinksFileEntry } from '~/types';

const columns = createColumns<SymlinksFileEntry>([
  {
    accessorKey: 'symlinkName',
    header: 'Symlink name',
    size: 180,
    minSize: 100,
  },
  {
    accessorKey: 'path',
    header: 'Symlink path',
    size: 220,
    minSize: 100,
  },
  {
    accessorKey: 'destinationPath',
    header: 'Destination path',
    size: 220,
    minSize: 100,
  },
  {
    accessorKey: 'typeOfError',
    header: 'Type of error',
    size: 140,
    minSize: 100,
  },
  {
    accessorKey: 'modifiedDate',
    header: 'Modified date',
    size: 160,
    minSize: 120,
  },
]);

export function InvalidSymlinks() {
  const data = useAtomValue(invalidSymlinksAtom);
  const [rowSelection, setRowSelection] = useAtom(
    invalidSymlinksRowSelectionAtom,
  );

  return (
    <DataTable
      className="flex-1 rounded-none border-none grow"
      data={data}
      columns={columns}
      rowIdField="path"
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
    />
  );
}
