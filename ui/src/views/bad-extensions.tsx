import { useAtom, useAtomValue } from 'jotai';
import {
  badExtensionsAtom,
  badExtensionsRowSelectionAtom,
} from '~/atom/primitive';
import {
  DataTable,
  createActionsColumn,
  createColumns,
} from '~/components/data-table';
import type { BadFileEntry } from '~/types';

const columns = createColumns<BadFileEntry>([
  {
    accessorKey: 'fileName',
    header: 'File name',
    size: 170,
    minSize: 100,
  },
  {
    accessorKey: 'path',
    header: 'Path',
    size: 200,
    minSize: 100,
  },
  {
    accessorKey: 'currentExtension',
    header: 'Current extension',
    size: 140,
    minSize: 140,
  },
  {
    accessorKey: 'properExtensionsGroup',
    header: 'Proper extension',
    size: 140,
    minSize: 140,
  },
  {
    accessorKey: 'modifiedDate',
    header: 'Modified date',
    size: 160,
    minSize: 120,
  },
  createActionsColumn(),
]);

export function BadExtensions() {
  const data = useAtomValue(badExtensionsAtom);
  const [rowSelection, setRowSelection] = useAtom(
    badExtensionsRowSelectionAtom,
  );

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
