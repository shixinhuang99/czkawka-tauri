import { useAtom, useAtomValue } from 'jotai';
import {
  currentToolDataAtom,
  currentToolRowSelectionAtom,
  currentToolSortingAtom,
} from '~/atom/tools';
import { createColumns, DataTable } from '~/components/data-table';
import { useT } from '~/hooks';
import type { FileEntry } from '~/types';

export function BigFiles() {
  const t = useT();
  const data = useAtomValue(currentToolDataAtom) as FileEntry[];
  const [rowSelection, setRowSelection] = useAtom(currentToolRowSelectionAtom);
  const [sorting, setSorting] = useAtom(currentToolSortingAtom);

  const columns = createColumns<FileEntry>([
    {
      accessorKey: 'size',
      header: t('size'),
      size: 110,
      minSize: 100,
      sortingFn: 'sortByRawDataNumber',
    },
    {
      accessorKey: 'fileName',
      header: t('fileName'),
      size: 180,
      minSize: 120,
    },
    {
      accessorKey: 'path',
      header: t('path'),
      size: 320,
      minSize: 100,
    },
    {
      accessorKey: 'modifiedDate',
      header: t('modifiedDate'),
      size: 160,
      minSize: 160,
      id: 'modified_date',
      sortingFn: 'sortByRawDataNumber',
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
