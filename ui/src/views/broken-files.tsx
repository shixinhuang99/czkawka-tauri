import { useAtom, useAtomValue } from 'jotai';
import {
  currentToolDataAtom,
  currentToolRowSelectionAtom,
  currentToolSortingAtom,
} from '~/atom/tools';
import { createColumns, DataTable } from '~/components/data-table';
import { useT } from '~/hooks';
import type { BrokenEntry } from '~/types';

export function BrokenFiles() {
  const data = useAtomValue(currentToolDataAtom) as BrokenEntry[];
  const [rowSelection, setRowSelection] = useAtom(currentToolRowSelectionAtom);
  const [sorting, setSorting] = useAtom(currentToolSortingAtom);
  const t = useT();

  const columns = createColumns<BrokenEntry>([
    {
      accessorKey: 'fileName',
      header: t('fileName'),
      size: 180,
      minSize: 100,
    },
    {
      accessorKey: 'path',
      header: t('path'),
      size: 200,
      minSize: 100,
    },
    {
      accessorKey: 'errorString',
      header: t('typeOfError'),
      size: 150,
      minSize: 110,
    },
    {
      accessorKey: 'size',
      header: t('size'),
      size: 110,
      minSize: 50,
    },
    {
      accessorKey: 'modifiedDate',
      header: t('modifiedDate'),
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
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
}
