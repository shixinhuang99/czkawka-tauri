import { useAtom, useAtomValue } from 'jotai';
import { emptyFilesAtom, emptyFilesRowSelectionAtom } from '~/atom/primitive';
import {
  DataTable,
  createActionsColumn,
  createColumns,
} from '~/components/data-table';
import type { FileEntry } from '~/types';

const columns = createColumns<FileEntry>([
  {
    accessorKey: 'fileName',
    header: 'File name',
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

export function EmptyFiles() {
  const data = useAtomValue(emptyFilesAtom);
  const [rowSelection, setRowSelection] = useAtom(emptyFilesRowSelectionAtom);

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
