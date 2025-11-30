import { useAtom, useAtomValue } from 'jotai';
import {
  emptyFoldersAtom,
  emptyFoldersRowSelectionAtom,
} from '~/atom/primitive';
import { currentToolSortingAtom } from '~/atom/tools';
import { createColumns, DataTable } from '~/components/data-table';
import { useT } from '~/hooks';
import type { FolderEntry } from '~/types';

export function EmptyFolders() {
  const data = useAtomValue(emptyFoldersAtom);
  const [rowSelection, setRowSelection] = useAtom(emptyFoldersRowSelectionAtom);
  const [sorting, setSorting] = useAtom(currentToolSortingAtom);
  const t = useT();

  const columns = createColumns<FolderEntry>([
    {
      accessorKey: 'folderName',
      header: t('folderName'),
      size: 180,
      minSize: 100,
    },
    {
      accessorKey: 'path',
      header: t('path'),
      size: 430,
      minSize: 100,
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
