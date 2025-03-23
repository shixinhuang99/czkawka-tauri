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
import { useT } from '~/hooks';
import type { BadFileEntry } from '~/types';

export function BadExtensions() {
  const data = useAtomValue(badExtensionsAtom);
  const [rowSelection, setRowSelection] = useAtom(
    badExtensionsRowSelectionAtom,
  );
  const t = useT();

  const columns = createColumns<BadFileEntry>([
    {
      accessorKey: 'fileName',
      header: t('File name'),
      size: 170,
      minSize: 100,
    },
    {
      accessorKey: 'path',
      header: t('Path'),
      size: 200,
      minSize: 100,
    },
    {
      accessorKey: 'currentExtension',
      header: t('Current extension'),
      size: 140,
      minSize: 140,
    },
    {
      accessorKey: 'properExtensionsGroup',
      header: t('Proper extension'),
      size: 140,
      minSize: 140,
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
