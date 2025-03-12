import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { bigFilesAtom } from '~/atom/primitive';
import {
  DataTable,
  type RowSelection,
  createColumns,
} from '~/components/data-table';
import type { FileEntry } from '~/types';

const columns = createColumns<FileEntry>([
  {
    accessorKey: 'size',
    header: 'Size',
    size: 100,
    minSize: 50,
  },
  {
    accessorKey: 'fileName',
    header: 'File name',
    minSize: 100,
  },
  {
    accessorKey: 'path',
    header: 'Path',
    size: 250,
    minSize: 100,
  },
  {
    accessorKey: 'modifiedDate',
    header: 'Modified date',
    minSize: 120,
  },
]);

export function BigFiles() {
  const [rowSelection, setRowSelection] = useState<RowSelection>({});
  const bigFiles = useAtomValue(bigFilesAtom);

  return (
    <DataTable
      className="flex-1 rounded-none border-none grow"
      data={bigFiles}
      columns={columns}
      rowIdField="path"
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
    />
  );
}
