import { useAtom, useAtomValue } from 'jotai';
import {
  badExtensionsAtom,
  badExtensionsRowSelectionAtom,
} from '~/atom/primitive';
import {
  createActionsColumn,
  createColumns,
  DataTable,
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
      header: t('fileName'),
      size: 170,
      minSize: 100,
    },
    {
      accessorKey: 'path',
      header: t('path'),
      size: 200,
      minSize: 100,
    },
    {
      accessorKey: 'currentExtension',
      header: t('currentExtension'),
      size: 140,
      minSize: 140,
    },
    {
      accessorKey: 'properExtensionsGroup',
      header: t('properExtension'),
      size: 140,
      minSize: 140,
    },
    {
      accessorKey: 'modifiedDate',
      header: t('modifiedDate'),
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
