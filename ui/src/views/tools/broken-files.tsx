import { useAtom, useAtomValue } from 'jotai';
import {
  currentToolDataAtom,
  currentToolRowSelectionAtom,
  currentToolSortingAtom,
} from '~/atom/tools';
import { createColumns, DataTable } from '~/components/data-table';
import { COLUMN_MIN_SIZES } from '~/consts';
import { useT } from '~/hooks';
import type { BrokenEntry } from '~/types';

export function BrokenFiles() {
  const data = useAtomValue(currentToolDataAtom) as BrokenEntry[];
  const [rowSelection, setRowSelection] = useAtom(currentToolRowSelectionAtom);
  const [sorting, setSorting] = useAtom(currentToolSortingAtom);
  const t = useT();

  const columns = createColumns<BrokenEntry>([
    {
      accessorKey: 'fileName',
      header: t('fileName'),
      size: 180,
      minSize: COLUMN_MIN_SIZES.fileName,
    },
    {
      accessorKey: 'path',
      header: t('path'),
      size: 190,
      minSize: COLUMN_MIN_SIZES.path,
    },
    {
      accessorKey: 'errorString',
      header: t('typeOfError'),
      size: COLUMN_MIN_SIZES.typeOfError,
      minSize: COLUMN_MIN_SIZES.typeOfError,
    },
    {
      accessorKey: 'size',
      header: t('size'),
      size: COLUMN_MIN_SIZES.size,
      minSize: COLUMN_MIN_SIZES.size,
      sortingFn: 'sortByRawDataNumber',
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
