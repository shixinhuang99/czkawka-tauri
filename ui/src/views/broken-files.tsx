import { useAtom, useAtomValue } from 'jotai';
import { brokenFilesAtom, brokenFilesRowSelectionAtom } from '~/atom/primitive';
import {
  DataTable,
  createActionsColumn,
  createColumns,
} from '~/components/data-table';
import type { BrokenEntry } from '~/types';

const columns = createColumns<BrokenEntry>([
  {
    accessorKey: 'fileName',
    header: 'File name',
    size: 180,
    minSize: 100,
  },
  {
    accessorKey: 'path',
    header: 'Path',
    size: 200,
    minSize: 100,
  },
  {
    accessorKey: 'errorString',
    header: 'Type of error',
    size: 160,
    minSize: 110,
  },
  {
    accessorKey: 'size',
    header: 'Size',
    size: 110,
    minSize: 50,
  },
  {
    accessorKey: 'modifiedDate',
    header: 'Modified date',
    size: 160,
    minSize: 120,
  },
  createActionsColumn(),
]);

export function BrokenFiles() {
  const data = useAtomValue(brokenFilesAtom);
  const [rowSelection, setRowSelection] = useAtom(brokenFilesRowSelectionAtom);

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
