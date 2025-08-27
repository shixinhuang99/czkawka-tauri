import { useAtom, useAtomValue } from 'jotai';
import {
  temporaryFilesAtom,
  temporaryFilesRowSelectionAtom,
} from '~/atom/primitive';
import {
  createActionsColumn,
  createColumns,
  DataTable,
} from '~/components/data-table';
import { useT } from '~/hooks';
import type { TemporaryFileEntry } from '~/types';

export function TemporaryFiles() {
  const data = useAtomValue(temporaryFilesAtom);
  const [rowSelection, setRowSelection] = useAtom(
    temporaryFilesRowSelectionAtom,
  );
  const t = useT();

  const columns = createColumns<TemporaryFileEntry>([
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
