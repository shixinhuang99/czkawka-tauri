import { useAtom, useAtomValue } from 'jotai';
import { emptyFilesAtom, emptyFilesRowSelectionAtom } from '~/atom/primitive';
import {
  DataTable,
  createActionsColumn,
  createColumns,
} from '~/components/data-table';
import { useT } from '~/hooks';
import type { FileEntry } from '~/types';

export function EmptyFiles() {
  const data = useAtomValue(emptyFilesAtom);
  const [rowSelection, setRowSelection] = useAtom(emptyFilesRowSelectionAtom);
  const t = useT();

  const columns = createColumns<FileEntry>([
    {
      accessorKey: 'fileName',
      header: t('File name'),
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
