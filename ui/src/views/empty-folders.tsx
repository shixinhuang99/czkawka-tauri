import { useAtom, useAtomValue } from 'jotai';
import {
  emptyFoldersAtom,
  emptyFoldersRowSelectionAtom,
} from '~/atom/primitive';
import {
  DataTable,
  createActionsColumn,
  createColumns,
} from '~/components/data-table';
import { useT } from '~/hooks';
import type { FolderEntry } from '~/types';

export function EmptyFolders() {
  const data = useAtomValue(emptyFoldersAtom);
  const [rowSelection, setRowSelection] = useAtom(emptyFoldersRowSelectionAtom);
  const t = useT();

  const columns = createColumns<FolderEntry>([
    {
      accessorKey: 'folderName',
      header: t('Folder name'),
      size: 180,
      minSize: 100,
    },
    {
      accessorKey: 'path',
      header: t('Path'),
      size: 430,
      minSize: 100,
    },
    {
      accessorKey: 'modifiedDate',
      header: t('Modified date'),
      size: 160,
      minSize: 120,
    },
    createActionsColumn(),
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
