import { useAtom, useAtomValue } from 'jotai';
import { bigFilesAtom, bigFilesRowSelectionAtom } from '~/atom/primitive';
import { currentToolSortingAtom } from '~/atom/tools';
import {
  createColumns,
  createSortingFnByRawData,
  DataTable,
} from '~/components/data-table';
import { useT } from '~/hooks';
import type { FileEntry } from '~/types';

export function BigFiles() {
  const t = useT();
  const data = useAtomValue(bigFilesAtom);
  const [rowSelection, setRowSelection] = useAtom(bigFilesRowSelectionAtom);
  const [sorting, setSorting] = useAtom(currentToolSortingAtom);

  const columns = createColumns<FileEntry>([
    {
      accessorKey: 'size',
      header: t('size'),
      size: 110,
      minSize: 50,
      sortingFn: createSortingFnByRawData('size', 'number'),
    },
    {
      accessorKey: 'fileName',
      header: t('fileName'),
      size: 180,
      minSize: 100,
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
      minSize: 120,
      sortingFn: createSortingFnByRawData('modified_date', 'number'),
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
