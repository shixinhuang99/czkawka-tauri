import { useAtom, useAtomValue } from 'jotai';
import {
  currentToolDataAtom,
  currentToolRowSelectionAtom,
  currentToolSortingAtom,
} from '~/atom/tools';
import { createColumns, DataTable } from '~/components/data-table';
import { COLUMN_MIN_SIZES } from '~/consts';
import { useT } from '~/hooks';
import type { FolderEntry } from '~/types';

export function EmptyFolders() {
  const data = useAtomValue(currentToolDataAtom) as FolderEntry[];
  const [rowSelection, setRowSelection] = useAtom(currentToolRowSelectionAtom);
  const [sorting, setSorting] = useAtom(currentToolSortingAtom);
  const t = useT();

  const columns = createColumns<FolderEntry>([
    {
      accessorKey: 'folderName',
      header: t('folderName'),
      size: 180,
      minSize: COLUMN_MIN_SIZES.folderName,
    },
    {
      accessorKey: 'path',
      header: t('path'),
      size: 430,
      minSize: COLUMN_MIN_SIZES.path,
    },
    {
      accessorKey: 'modifiedDate',
      header: t('modifiedDate'),
      size: COLUMN_MIN_SIZES.modifiedDate,
      minSize: COLUMN_MIN_SIZES.modifiedDate,
      id: 'modified_date',
      sortingFn: 'sortByRawDataNumber',
    },
  ]);

  return (
    <DataTable
      className="flex-1 rounded-none border-none grow"
      data={data}
      columns={columns}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
}
