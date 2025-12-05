import { useAtom, useAtomValue } from 'jotai';
import {
  currentToolDataAtom,
  currentToolRowSelectionAtom,
  currentToolSortingAtom,
} from '~/atom/tools';
import { createColumns, DataTable } from '~/components/data-table';
import { COLUMN_MIN_SIZES } from '~/consts';
import { useT } from '~/hooks';
import type { FileEntry } from '~/types';

export function BigFiles() {
  const t = useT();
  const data = useAtomValue(currentToolDataAtom) as FileEntry[];
  const [rowSelection, setRowSelection] = useAtom(currentToolRowSelectionAtom);
  const [sorting, setSorting] = useAtom(currentToolSortingAtom);

  const columns = createColumns<FileEntry>([
    {
      accessorKey: 'size',
      header: t('size'),
      size: 110,
      minSize: COLUMN_MIN_SIZES.size,
      sortingFn: 'sortByRawDataNumber',
    },
    {
      accessorKey: 'fileName',
      header: t('fileName'),
      size: 180,
      minSize: COLUMN_MIN_SIZES.fileName,
    },
    {
      accessorKey: 'path',
      header: t('path'),
      size: 320,
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
