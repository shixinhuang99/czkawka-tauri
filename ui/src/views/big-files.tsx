import { useAtom, useAtomValue } from 'jotai';
import { bigFilesAtom, bigFilesRowSelectionAtom } from '~/atom/primitive';
import {
  DataTable,
  createActionsColumn,
  createColumns,
} from '~/components/data-table';
import type { FileEntry } from '~/types';

const columns = createColumns<FileEntry>([
  {
    accessorKey: 'size',
    header: 'Size',
    size: 110,
    minSize: 50,
  },
  {
    accessorKey: 'fileName',
    header: 'File name',
    size: 180,
    minSize: 100,
  },
  {
    accessorKey: 'path',
    header: 'Path',
    size: 320,
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

export function BigFiles() {
  const data = useAtomValue(bigFilesAtom);
  const [rowSelection, setRowSelection] = useAtom(bigFilesRowSelectionAtom);

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
