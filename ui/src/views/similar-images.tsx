import type { Row } from '@tanstack/react-table';
import { useAtom, useAtomValue } from 'jotai';
import { settingsAtom } from '~/atom/settings';
import {
  currentToolDataAtom,
  currentToolRowSelectionAtom,
  currentToolSortingAtom,
} from '~/atom/tools';
import { createColumns, DataTable } from '~/components/data-table';
import { useT } from '~/hooks';
import type { ImagesEntry } from '~/types';
import { ImagePreview } from './image-preview';

export function SimilarImages() {
  const data = useAtomValue(currentToolDataAtom) as ImagesEntry[];
  const [rowSelection, setRowSelection] = useAtom(currentToolRowSelectionAtom);
  const [sorting, setSorting] = useAtom(currentToolSortingAtom);
  const t = useT();

  const columns = createColumns<ImagesEntry>([
    {
      accessorKey: 'similarity',
      header: t('similarity'),
      size: 100,
      minSize: 80,
    },
    {
      accessorKey: 'size',
      header: t('size'),
      size: 100,
      minSize: 50,
    },
    {
      accessorKey: 'dimensions',
      header: t('dimensions'),
      size: 100,
      minSize: 100,
    },
    {
      accessorKey: 'fileName',
      header: t('fileName'),
      size: 150,
      minSize: 100,
      cell: ({ row }) => {
        return <FileName row={row} />;
      },
    },
    {
      accessorKey: 'path',
      header: t('path'),
      size: 160,
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
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
}

function FileName(props: { row: Row<ImagesEntry> }) {
  const { row } = props;
  const { hidden, path, fileName } = row.original;

  const settings = useAtomValue(settingsAtom);

  if (hidden) {
    return null;
  }

  if (settings.similarImagesShowImagePreview) {
    return (
      <ImagePreview path={path}>
        <div className="truncate">{fileName}</div>
      </ImagePreview>
    );
  }

  return fileName;
}
