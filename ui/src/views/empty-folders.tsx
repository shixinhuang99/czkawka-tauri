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
import type { FolderEntry } from '~/types';

const columns = createColumns<FolderEntry>([
  {
    accessorKey: 'folderName',
    header: 'Folder name',
    size: 180,
    minSize: 100,
  },
  {
    accessorKey: 'path',
    header: 'Path',
    size: 430,
    minSize: 100,
  },
  {
    accessorKey: 'modifiedDate',
    header: 'Modified date',
    size: 160,
    minSize: 120,
  },
  createActionsColumn(),
]);

export function EmptyFolders() {
  const data = useAtomValue(emptyFoldersAtom);
  const [rowSelection, setRowSelection] = useAtom(emptyFoldersRowSelectionAtom);

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
