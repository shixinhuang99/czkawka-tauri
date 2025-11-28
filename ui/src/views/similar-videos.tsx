import { useAtom, useAtomValue } from 'jotai';
import {
  similarVideosAtom,
  similarVideosRowSelectionAtom,
} from '~/atom/primitive';
import { createColumns, DataTable } from '~/components/data-table';
import { useT } from '~/hooks';
import type { VideosEntry } from '~/types';

export function SimilarVideos() {
  const data = useAtomValue(similarVideosAtom);
  const [rowSelection, setRowSelection] = useAtom(
    similarVideosRowSelectionAtom,
  );
  const t = useT();

  const columns = createColumns<VideosEntry>([
    {
      accessorKey: 'size',
      header: t('size'),
      size: 110,
      minSize: 50,
    },
    {
      accessorKey: 'fileName',
      header: t('fileName'),
      size: 180,
      minSize: 100,
    },
    {
      accessorKey: 'path',
      header: t('path'),
      size: 320,
      minSize: 100,
      cell: ({ row }) => {
        if (row.original.hidden) {
          return null;
        }
        return row.original.path;
      },
    },
    {
      accessorKey: 'modifiedDate',
      header: t('modifiedDate'),
      size: 160,
      minSize: 120,
    },
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
